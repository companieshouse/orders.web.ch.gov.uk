import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { Item as CheckoutItem, Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { createLogger } from "@companieshouse/structured-logging-node";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";

import { getCheckout, getBasket, getBasketLinks, getPaymentStatus } from "../client/api.client";
import { APPLICATION_NAME, CHS_URL } from "../config/config";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { ConfirmationTemplateFactory, DefaultConfirmationTemplateFactory } from "./ConfirmationTemplateFactory";
import { InternalServerError } from "http-errors";
import { getWhitelistedReturnToURL } from "../utils/request.util";
import { BasketLink, getBasketLink } from "../utils/basket.util";
import { mapPageHeader } from "../utils/page.header.utils";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { getKey } from "../utils/redisMethods";

const logger = createLogger(APPLICATION_NAME);

const factory: ConfirmationTemplateFactory = new DefaultConfirmationTemplateFactory();

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.orderId;
        const status = req.query.status;
        const queryRef= req.query.ref;
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        const itemType = req.query.itemType;
        const serviceName = "Find and update company information";
        const serviceUrl = CHS_URL;

        const basketLinks = await getBasketLinks(accessToken);
        const pageHeader = mapPageHeader(req);
        if (basketLinks.data.enrolled) {
            logger.info(`Order confirmation, order_id=${orderId}, ref=${queryRef}, status=${status}, user_id=${userId}`);
        } else {
            logger.info(`Order confirmation, order_id=${orderId}, ref=${queryRef}, status=${status}, itemType=${itemType}, user_id=${userId}`);
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

        const originalUrl = req.originalUrl;
        const separator = originalUrl.includes('?') ? '&' : '?';

        const redirectWithItemTypes = (itemTypes: string) => {
            const redirectUrl = getWhitelistedReturnToURL(originalUrl) + separator + itemTypes;
            return res.redirect(redirectUrl);
        };

        // Required to capture order type in matomo (item type is not a query param)
        if (!basketLinks.data.enrolled && (itemType === undefined || itemType === "")) {
            const itemTypes = getItemTypeUrlParam(checkout?.items?.[0]);
            return redirectWithItemTypes(itemTypes);
        } else if (basketLinks.data.enrolled && req.query.itemTypes === undefined) {
            const itemTypes = getItemTypesUrlParam(checkout?.items);
            logger.info(`ItemTypes=${itemTypes}`);
            return redirectWithItemTypes(itemTypes);
        }

        logger.info(`Checkout retrieved checkout_id=${checkout.reference}, user_id=${userId}`);

        const paymentRef = await getKey(userId!);
        if (!paymentRef) {
            logger.info(`Payment reference expired or not found for userId=${userId}`);
            throw new InternalServerError("Payment reference expired or not found");
        }
   
        logger.info(`Retrieved payment reference: ${paymentRef} for userId=${userId}`);

        const resource = await getPaymentDetails(paymentRef, status, queryRef, accessToken);

        const basket: Basket = await getBasket(accessToken);
        const basketLink: BasketLink = await getBasketLink(req, basket);

        /*update the Payment response with the reference from the session (from CreatePayment in basket controller)
        and paymentReference from API response. 
        */
        const updatedPayment: Payment = {
            ...resource,
            reference: paymentRef
        };
        const mappedItem = factory.getMapper(basketLinks.data).map(checkout, updatedPayment);

        res.render(mappedItem.templateName, { ...mappedItem, ...basketLink, ...pageHeader, serviceName, serviceUrl });

    } catch (err) {
        logger.error(`Error rendering order confirmation page: ${err}`);
        next(err);
    }
};

export const getPaymentDetails = async (paymentRef: string, status: any, queryRef: any, accessToken: string) =>{
    logger.info(`Validating payment using Payments API for ref=${paymentRef}`);
    const paymentResponse = await getPaymentStatus(accessToken, paymentRef);

    const resource = paymentResponse.resource as Payment;  
    const reference = paymentResponse.resource?.reference;
    const paymentStatus = paymentResponse.resource?.status;

    // Compare 'reference' from paymentAPI response with queryParam reference
    if (queryRef !== reference) {
        logger.error(`Payment references validation failed references: ${queryRef} and ${reference} do not match`);
        throw new InternalServerError("Payment References do not match");
    }

    // Compare status from paymentAPI response with queryParam status
    if (paymentStatus !== status) {
        logger.error(`Payment status validation failed statues: ${paymentStatus} and ${status} do not match}`);
        throw new InternalServerError("Payment statuses from API does not match");
    }
    return resource;
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
            return "itemType=dissolved-certificate";
        }
        return "itemType=certificate";
    }

    if (item?.kind === "item#certified-copy") {
        return "itemType=certified-copy";
    }

    if (item?.kind === "item#missing-image-delivery") {
        return "itemType=missing-image-delivery";
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
    return `itemTypes=${Array.from(uniqueItemTypes).sort((a, b) => a - b).join(',')}`;
};