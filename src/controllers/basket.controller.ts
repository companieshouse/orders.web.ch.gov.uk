import { NextFunction, Request, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { ApiResponse } from "ch-sdk-node/dist/services/resource";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";
import { createLogger } from "ch-structured-logging";

import { checkoutBasket, createPayment } from "../client/api.client";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";
import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";

const logger = createLogger(APPLICATION_NAME);

const PAYMENT_REQUIRED_HEADER = "X-Payment-Required";

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        const email = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.Email];

        const checkoutApiResponse: ApiResponse<Checkout> = await checkoutBasket(accessToken);

        const checkoutId = checkoutApiResponse.resource?.reference;
        logger.info(`Checkoud created, checkout_id=${checkoutId}, user_id=${userId}, email=${email}`)

        // for unknown reasons, the sdk brings X-Payment-Required come back as x-payment-required
        const paymentRequired = Object.keys(checkoutApiResponse?.headers as Array<String>)
            .find((header: string) => header.toLowerCase() === PAYMENT_REQUIRED_HEADER.toLowerCase());

        
        if (paymentRequired) {
            const paymentUrl = checkoutApiResponse?.headers?.[paymentRequired];
            logger.info(`Payment is required, checkout_id=${checkoutId}, user_id=${userId}, email=${email}`);
            const paymentResponse = await createPayment(accessToken, paymentUrl, checkoutApiResponse.resource?.reference!);

            const paymentRedirectUrl = paymentResponse.resource?.links.journey!;
            logger.info(`Payment session created, redirecting to ${paymentRedirectUrl}, reference=${paymentResponse.resource?.reference}, amount=${paymentResponse.resource?.amount}, user_id=${userId}, email=${email}`);
            res.redirect(paymentRedirectUrl + "?summary=false");
        } else {
            logger.info(`Payment is not required, order_id=${checkoutId}, user_id=${userId}, email=${email}`);
            res.redirect(replaceOrderId(ORDER_COMPLETE, checkoutApiResponse.resource?.reference!));
        }
    } catch (err) {
        next(err);
    }
};
