import { NextFunction, Request, Response } from "express";
import { Session } from "ch-node-session-handler";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { CertificateItemOptions, Item, Order } from "api-sdk-node/dist/services/order/order";
import { createLogger } from "ch-structured-logging";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";

import { getOrder, getBasket } from "../client/api.client";
import { ORDER_COMPLETE } from "../model/template.paths";
import { APPLICATION_NAME } from "../config/config";
import { mapItem } from "../service/map.item.service";
import { mapDate } from "../utils/date.util";
import { Basket } from "api-sdk-node/dist/services/order/basket";

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

        logger.info(`Order confirmation, order_id=${orderId}, ref=${ref}, status=${status}, itemType=${itemType}, user_id=${userId}`);
        if (status === "cancelled" || status === "failed") {
            const basket: Basket = await getBasket(accessToken);
            const item = basket?.items?.[0];
            const itemId = item?.id;
            const itemOptions = item?.itemOptions;
            const certType = itemOptions?.certificateType.toString();
            let redirectUrl;
            if ((item?.kind === "item#certificate" && certType !== "dissolution") || item?.kind === "item#certified-copy" || item?.kind === "item#missing-image-delivery") {
                redirectUrl = item?.itemUri + "/check-details";
            } else {
                redirectUrl = `/orderable/dissolved-certificates/${itemId}/check-details`;
            }
            logger.info(`Redirecting to ${redirectUrl}`);
            return res.redirect(redirectUrl);
        };

        const order: Order = await getOrder(accessToken, orderId);
        if (itemType === undefined || itemType === "") {
            const item = order?.items?.[0];
            return res.redirect(req.originalUrl + getItemTypeUrlParam(item));
        }

        logger.info(`Order retrieved order_id=${order.reference}, user_id=${userId}`);

        const orderDetails = {
            referenceNumber: order.reference,
            referenceNumberAriaLabel: order.reference.replace(/-/g, " hyphen ")
        };

        const item = order.items[0];

        const totalItemsCost = `£${item?.totalItemCost}`;

        const paymentDetails = {
            amount: "£" + order?.totalOrderCost,
            paymentReference: order?.paymentReference,
            orderedAt: mapDate(order?.orderedAt)
        };

        const itemKind = item?.kind;

        const mappedItem = mapItem(item, order?.deliveryDetails);

        res.render(ORDER_COMPLETE, {
            ...mappedItem,
            companyNumber: item?.companyNumber,
            orderDetails,
            paymentDetails,
            itemKind,
            totalItemsCost,
            templateName: ORDER_COMPLETE
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
