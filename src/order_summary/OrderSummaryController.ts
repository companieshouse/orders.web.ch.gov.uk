import { NextFunction, Request, Response } from "express";
import { OrderSummaryFetchable } from "./OrderSummaryService";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ORDER_SUMMARY } from "../model/template.paths";
import { NotFound, Unauthorized } from "http-errors";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME, CHS_URL } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { mapPageHeader } from "../utils/page.header.utils";
import { getBasket } from "../client/api.client";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { BasketLink, getBasketLink } from "../utils/basket.util";

const logger = createLogger(APPLICATION_NAME);

export class OrderSummaryController {

    private service: OrderSummaryFetchable;

    constructor (service: OrderSummaryFetchable) {
        this.service = service;
    }

    async readOrder(req: Request, res: Response, next: NextFunction) {
        const orderId = req.params.orderId;
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        try {
            logger.debug(`Retrieving summary for order [${orderId}] for user [${userId}]...`);
            const serviceName = "Find and update company information";   
            const serviceUrl = CHS_URL;
            const pageHeader = mapPageHeader(req);
            const basket: Basket = await getBasket(accessToken);
            const basketLink: BasketLink = await getBasketLink(req, basket);
            const viewModel = await this.service.fetchOrderSummary(orderId, accessToken);
            logger.debug(`Retrieved summary for order [${orderId}] for user [${userId}]`);
            return res.render(ORDER_SUMMARY, { ...viewModel, ...pageHeader, ...basketLink, serviceName, serviceUrl });
        } catch (error) {
            if (error instanceof Unauthorized) {
                logger.info(`User [${userId}] is not authorised to retrieve summary for order [${orderId}]`);
                next();
            } else if (error instanceof NotFound) {
                logger.info(`Order [${orderId}] does not exist`);
                next();
            } else {
                logger.error(`Error displaying summary for order [${orderId}] for user [${userId}]`);
                next(error);
            }
        }
    }
}
