import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Basket, Checkout, BasketLinks } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { createLogger } from "ch-structured-logging";
import { HttpError } from "http-errors";

import { checkoutBasket, createPayment, getBasket, getBasketLinks, removeBasketItem } from "../client/api.client";
import { ORDER_COMPLETE, replaceOrderId, BASKET as BASKET_URL } from "../model/page.urls";
import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import * as templatePaths from "../model/template.paths";
import { BASKET } from "../model/template.paths";
import { BasketItemsMapper } from "../mappers/BasketItemsMapper";

const logger = createLogger(APPLICATION_NAME);

const PAYMENT_REQUIRED_HEADER = "X-Payment-Required";

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

        const basketResource: Basket = await getBasket(accessToken);

        if (basketResource.enrolled) {
            logger.debug(`User [${userId}] is enrolled; rendering basket page...`);
            res.render(BASKET, new BasketItemsMapper().mapBasketItems(basketResource));
        } else {
            logger.debug(`User [${userId}] is not enrolled; proceeding to payment...`);
            await proceedToPayment(req, res, next);
        }
    } catch (err) {
        if (err instanceof HttpError) {
            const statusCode: number = err?.statusCode || 500;
            let template: string = templatePaths.ERROR;
            const errorMessage: string = err?.message || "";
            if (statusCode === 409 && err?.message?.includes("Delivery details missing for postal delivery")) {
                template = templatePaths.ERROR_START_AGAIN;
            }
            res.status(statusCode).render(template, { errorMessage });
        } else {
            next(err);
        }
    }
};

export const handlePostback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await proceedToPayment(req, res, next);
    } catch (err) {
        if (err instanceof HttpError) {
            const statusCode: number = err?.statusCode || 500;
            let template: string = templatePaths.ERROR;
            const errorMessage: string = err?.message || "";
            if (statusCode === 409 && err?.message?.includes("Delivery details missing for postal delivery")) {
                template = templatePaths.ERROR_START_AGAIN;
            }
            res.status(statusCode).render(template, { errorMessage });
        } else {
            next(err);
        }
    }
};

const proceedToPayment = async (req: Request, res: Response, next: NextFunction) => {
    const signInInfo = req.session?.data[SessionKey.SignInInfo];
    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
    const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

    const checkoutApiResponse: ApiResponse<Checkout> = await checkoutBasket(accessToken);

    const checkoutId = checkoutApiResponse.resource?.reference;
    logger.info(`Checkout created, checkout_id=${checkoutId}, user_id=${userId}`);

    // for unknown reasons, the sdk brings X-Payment-Required come back as x-payment-required
    const paymentRequired = Object.keys(checkoutApiResponse?.headers as Array<String>)
        .find((header: string) => header.toLowerCase() === PAYMENT_REQUIRED_HEADER.toLowerCase());

    if (paymentRequired) {
        const paymentUrl = checkoutApiResponse?.headers?.[paymentRequired];
        logger.info(`Payment is required, checkout_id=${checkoutId}, user_id=${userId}`);
        const paymentResponse = await createPayment(accessToken, paymentUrl, checkoutApiResponse.resource?.reference!);

        const paymentRedirectUrl = paymentResponse.resource?.links.journey!;
        logger.info(`Payment session created, redirecting to ${paymentRedirectUrl}, reference=${paymentResponse.resource?.reference}, amount=${paymentResponse.resource?.amount}, user_id=${userId}`);
        res.redirect(paymentRedirectUrl + "?summary=false");
    } else {
        logger.info(`Payment is not required, order_id=${checkoutId}, user_id=${userId}`);
        res.redirect(replaceOrderId(ORDER_COMPLETE, checkoutApiResponse.resource?.reference!));
    }
};

export const handleRemovePostback = async (req: Request, res: Response, next: NextFunction) => {
    const signInInfo = req.session?.data[SessionKey.SignInInfo];
    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
    const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

    const urlArray = req.url.split("/");
    const itemId = urlArray[urlArray.length - 1];

    const basketLinksResponse: BasketLinks = await getBasketLinks(accessToken);

    const itemUri = basketLinksResponse.data.items?.find(item => item.itemUri.includes(itemId));

    if (!itemUri) {
        logger.info(`Could not find a match for itemId and itemUri, user_id=${userId}`);
    } else {
        const response: ApiResponse<any> = await removeBasketItem(itemUri, accessToken);
        logger.info(`Remove basket item response status=${response.httpStatusCode}, user_id=${userId}`);
    }
    return res.redirect(BASKET_URL);
};
