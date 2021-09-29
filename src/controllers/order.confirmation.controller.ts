import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { CertificateItemOptions, Item } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { createLogger } from "ch-structured-logging";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";

import { getCheckout, getBasket } from "../client/api.client";
import { ORDER_COMPLETE } from "../model/template.paths";
import { APPLICATION_NAME } from "../config/config";
import { mapItem } from "../service/map.item.service";
import { mapDate } from "../utils/date.util";
import { Basket, BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/basket";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.orderId;
        const status = req.query.status;
        const ref = req.query.ref;
        const itemType = req.query.itemType;
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        const CERTIFICATE_PAGE_TITLE = "Certificate ordered - Order a certificate - GOV.UK";
        const CERTIFIED_COPY_PAGE_TITLE = "Certified document order confirmed - Order a certified document - GOV.UK";
        const MID_PAGE_TITLE = "Document Requested - Request a document - GOV.UK";

        logger.info(`Order confirmation, order_id=${orderId}, ref=${ref}, status=${status}, itemType=${itemType}, user_id=${userId}`);
        if (status === "cancelled" || status === "failed") {
            const basket: Basket = await getBasket(accessToken);
            const item = basket?.items?.[0];
            const itemId = item?.id;
            const redirectUrl: string = getRedirectUrl(item, itemId);
            logger.info(`Redirecting to ${redirectUrl}`);
            return res.redirect(redirectUrl);
        };

        const checkout: Checkout = await getCheckout(accessToken, orderId);
        if (itemType === undefined || itemType === "") {
            const item = checkout?.items?.[0];
            return res.redirect(req.originalUrl + getItemTypeUrlParam(item));
        }

        logger.info(`Checkout retrieved checkout_id=${checkout.reference}, user_id=${userId}`);

        const orderDetails = {
            referenceNumber: checkout.reference,
            referenceNumberAriaLabel: checkout.reference.replace(/-/g, " hyphen ")
        };

        const item = checkout.items[0];

        const totalItemsCost = `£${item?.totalItemCost}`;

        let paymentReference: string = checkout?.paymentReference;
        let paidAt: string = checkout?.paidAt;

        // A race condition exists with the payment, therefore it is sometimes required to retry
        if (paidAt === undefined || paymentReference === undefined) {
            logger.info(`paid_at or payment_reference returned undefined paid_at=${checkout.paidAt}, payment_reference=${checkout.paymentReference} user_id=${userId} - retrying get checkout`);
            const retryCheckout: Checkout = await getCheckout(accessToken, orderId);
            paidAt = retryCheckout.paidAt;
            paymentReference = retryCheckout.paymentReference;
        }

        const paymentDetails = {
            amount: "£" + checkout?.totalOrderCost,
            paymentReference: checkout?.paymentReference,
            orderedAt: mapDate(paidAt)
        };

        const itemKind = item?.kind;
        const piwikLink = getPiwikURL(item);

        const mappedItem = mapItem(item, checkout?.deliveryDetails);

        const pageTitle = item?.kind === "item#certificate" ? CERTIFICATE_PAGE_TITLE : item?.kind === "item#certified-copy"
            ? CERTIFIED_COPY_PAGE_TITLE : item?.kind === "item#missing-image-delivery" ? MID_PAGE_TITLE : "";

        res.render(ORDER_COMPLETE, {
            ...mappedItem,
            companyNumber: item?.companyNumber,
            orderDetails,
            paymentDetails,
            itemKind,
            piwikLink,
            totalItemsCost,
            templateName: ORDER_COMPLETE,
            pageTitleText: pageTitle
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const getItemTypeUrlParam = (item: Item):string => {
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

export const getPiwikURL = (item: Item):string => {
   

    if (item?.kind === "item#certificate") {
        return "certificates";
    }

    if (item?.kind === "item#certified-copy") {
        return "certified-copies";
    }

    return "";
};

export const getRedirectUrl = (item: BasketItem | undefined, itemId: string | undefined):string => {
    if (item?.kind === "item#certificate") {
        const itemOptions = item?.itemOptions;
        const certType = itemOptions?.certificateType.toString();
        if (certType === "dissolution") {
            return `/orderable/dissolved-certificates/${itemId}/check-details`;
        }
    }
    return item?.itemUri + "/check-details";
};
