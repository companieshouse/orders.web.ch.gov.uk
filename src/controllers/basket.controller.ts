import { NextFunction, Request, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo, IAccessToken } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { ApiResponse } from "ch-sdk-node/dist/services/resource";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";

import { checkoutBasket, createPayment } from "../client/api.client";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";

const PAYMENT_REQUIRED_HEADER = "X-Payment-Required";

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signInInfo = req.session
            .map((_) => _.getValue<ISignInInfo>(SessionKey.SignInInfo))
            .unsafeCoerce();

        const accessToken = signInInfo
            .map((info) => info[SignInInfoKeys.AccessToken])
            .map((token: IAccessToken) => token.access_token as string)
            .unsafeCoerce();

        const checkoutApiResponse: ApiResponse<Checkout> = await checkoutBasket(accessToken);

        // for unknown reasons, the sdk brings X-Payment-Required come back as x-payment-required
        const paymentRequired = Object.keys(checkoutApiResponse?.headers as Array<String>)
            .find((header: string) => header.toLowerCase() === PAYMENT_REQUIRED_HEADER.toLowerCase());

        if (paymentRequired) {
            const paymentUrl = checkoutApiResponse?.headers?.[paymentRequired];
            const paymentResponse = await createPayment(accessToken, paymentUrl, checkoutApiResponse.resource?.reference!);
            res.redirect(paymentResponse.resource?.links.journey!);
        } else {
            res.redirect(replaceOrderId(ORDER_COMPLETE, checkoutApiResponse.resource?.reference!));
        }
    } catch (err) {
        next(err);
    }
};
