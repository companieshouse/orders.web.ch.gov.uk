import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { Item as CheckoutItem, Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { createLogger } from "@companieshouse/structured-logging-node";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";

import { getCheckout, getBasket, getBasketLinks } from "../client/api.client";
import { APPLICATION_NAME, RETRY_CHECKOUT_NUMBER, RETRY_CHECKOUT_DELAY, CHS_URL } from "../config/config";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { ConfirmationTemplateFactory, DefaultConfirmationTemplateFactory } from "./ConfirmationTemplateFactory";
import { InternalServerError } from "http-errors";
import { getWhitelistedReturnToURL } from "../utils/request.util";
import { BasketLink, getBasketLink } from "../utils/basket.util";
import { mapPageHeader } from "../utils/page.header.utils";

const logger = createLogger(APPLICATION_NAME);

const factory: ConfirmationTemplateFactory = new DefaultConfirmationTemplateFactory();

type CheckoutPollResult = {
    success: boolean;
    data?: {
        paidAt?: string;
        paymentReference?: string;
    }
};

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.orderId;
        const status = req.query.status;
        const ref = req.query.ref;
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        const itemType = req.query.itemType;
        const serviceName = "Find and update company information";
        const serviceUrl = CHS_URL;

        const basketLinks = await getBasketLinks(accessToken);
        const pageHeader = mapPageHeader(req);

        if (basketLinks.data.enrolled) {
            logger.info(`Order confirmation, order_id=${orderId}, ref=${ref}, status=${status}, user_id=${userId}`);
        } else {
            logger.info(`Order confirmation, order_id=${orderId}, ref=${ref}, status=${status}, itemType=${itemType}, user_id=${userId}`);
        }

        if (status === "cancelled" || status === "failed") {
            const basket: Basket = await getBasket(accessToken);
            if (basket.enrolled) {
                return res.redirect("/basket");
            } else {
                const item = basket?.items?.[0];
                const itemId = item?.id;
                const redirectUrl: string = getRedirectUrl(item, itemId);
                logger.info(`Redirecting to ${redirectUrl}`);
                return res.redirect(redirectUrl);
            }
        }

        const checkout = (await getCheckout(accessToken, orderId)).resource as Checkout;

        // required to capture order type in matomo
        if (!basketLinks.data.enrolled && (itemType === undefined || itemType === "")) {
            const item = checkout?.items?.[0];
            return res.redirect(getWhitelistedReturnToURL(req.originalUrl) + getItemTypeUrlParam(item));
        }
        else if (basketLinks.data.enrolled && req.query.itemTypes === undefined) {
            return res.redirect(getWhitelistedReturnToURL(req.originalUrl) + getItemTypesUrlParam(checkout?.items));
        }

        logger.info(`Checkout retrieved checkout_id=${checkout.reference}, user_id=${userId}`);

        // A race condition exists with the payment, therefore it is sometimes required to retry
        if (checkout?.paidAt === undefined || checkout?.paymentReference === undefined) {
            logger.info(`paid_at or payment_reference returned undefined paid_at=${checkout.paidAt}, payment_reference=${checkout.paymentReference} order_id=${orderId} - retrying get checkout`);
            const result = await retryGetCheckout(accessToken, orderId);
            if (result.success) {
                checkout.paidAt = result.data?.paidAt;
                checkout.paymentReference = result.data?.paymentReference;
            } else {
                throw new InternalServerError("Error polling checkout " + orderId + " for updated payment info");
            }
        }

        const basket: Basket = await getBasket(accessToken);
        const basketLink: BasketLink = await getBasketLink(req, basket);

        const mappedItem = factory.getMapper(basketLinks.data).map(checkout);
        res.render(mappedItem.templateName, { ...mappedItem, ...basketLink, ...pageHeader, serviceName, serviceUrl });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const getRedirectUrl = (item: BasketItem | undefined, itemId: string | undefined):string => {
    if (item?.kind === "item#certificate") {
        const itemOptions = item?.itemOptions as CertificateItemOptions;
        const certType = itemOptions?.certificateType;
        if (certType === "dissolution") {
            return `/orderable/dissolved-certificates/${itemId}/check-details`;
        }
    }
    return item?.itemUri + "/check-details";
};

export const getItemTypeUrlParam = (item: CheckoutItem): string => {
    if (item?.kind === "item#certificate") {
        const itemOptions = item.itemOptions as CertificateItemOptions;
        if (itemOptions?.certificateType === "dissolution") {
            return "&itemType=dissolved-certificate";
        }
        return "&itemType=certificate";
    }

    if (item?.kind === "item#certified-copy") {
        return "&itemType=certified-copy";
    }

    if (item?.kind === "item#missing-image-delivery") {
        return "&itemType=missing-image-delivery";
    }

    return "";
};

export const getItemTypesUrlParam = (items: CheckoutItem[]): string => {
    // Define the mapping of item types to their respective numbers
    const itemTypeMap: { [key: string]: number } = {
        'item#certificate': 1,
        'item#certified-copy': 2,
        'item#missing-image-delivery': 3,
        'item#dissolution': 4
      };

    // Create a Set to store unique item type numbers
    const uniqueItemTypes = new Set<number>();

    // Loop through each item and add the corresponding number to the Set
    items.forEach(item => {
        if (item?.kind === "item#certificate") {
            //Check certificate type, if it's a dissolution add it as a new type
            const itemOptions = item.itemOptions as CertificateItemOptions;
            if (itemOptions?.certificateType === "dissolution") {
                uniqueItemTypes.add(itemTypeMap['item#dissolution']);
            } else {
                uniqueItemTypes.add(itemTypeMap['item#certificate']);
            }
        } else {
            const itemTypeNumber = itemTypeMap[item.kind];
            if (itemTypeNumber) {
                uniqueItemTypes.add(itemTypeNumber);
            }
        }
    });

  // Convert the Set to an array, sort it, and join the elements with commas
  return `&itemTypes=${Array.from(uniqueItemTypes).sort((a, b) => a - b).join(',')}`;
};

export const retryGetCheckout = async (accessToken, orderId: string) => {
    return new Promise<CheckoutPollResult>((resolve) => {
        let retries = 1;
        const checkoutInterval = setInterval(
            async () => {
                let retryCheckout;
                try {
                    retryCheckout = (await getCheckout(accessToken, orderId)).resource as Checkout;
                } catch (error) {
                    logger.error(`Failed to poll checkout resource for order_id=${orderId} with error: ${error.message}`);
                    resolve({ success: false });
                    clearInterval(checkoutInterval);
                    return;
                }

                let paidAt = retryCheckout.paidAt;
                let paymentReference = retryCheckout.paymentReference;

                if(paidAt === undefined || paymentReference === undefined) {
                    logger.info(`Retry attempt ${retries} failed to return paid_at or payment_reference for order_id=${orderId}`);
                    retries++;
                } else {
                    logger.info(`paid_at and payment_reference returned successfully on retry attempt ${retries},
                        order_id=${orderId} paid_at=${paidAt}, payment_reference=${paymentReference}`);
                    resolve({ success: true, data: { paidAt: paidAt, paymentReference: paymentReference } });
                    clearInterval(checkoutInterval);
                }
                if(retries >= parseInt(RETRY_CHECKOUT_NUMBER)) {
                    logger.error(`paid_at or payment_reference returned undefined after ${retries} retries,
                        order_id=${orderId} paid_at=${paidAt}, payment_reference=${paymentReference}`);
                    resolve({ success: false });
                    clearInterval(checkoutInterval);
                }
            }
        , parseInt(RETRY_CHECKOUT_DELAY));
    });
};
