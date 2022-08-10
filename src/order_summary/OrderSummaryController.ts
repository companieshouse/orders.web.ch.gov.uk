import { NextFunction, Request, Response } from "express";
import { OrderSummaryFetchable } from "./OrderSummaryService";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ERROR_UNAUTHORISED, ORDER_SUMMARY } from "../model/template.paths";
import { NotFound, Unauthorized } from "http-errors";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";

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
            const viewModel = await this.service.fetchOrderSummary(orderId, accessToken);
            logger.debug(`Retrieved summary for order [${orderId}] for user [${userId}]`);
            return res.render(ORDER_SUMMARY, viewModel);
        } catch (error) {
            if (error instanceof Unauthorized) {
                logger.info(`User [${userId}] is not authorised to retrieve summary for order [${orderId}]`);
                res.status(401);
                return res.render(ERROR_UNAUTHORISED);
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
