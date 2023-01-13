import { NextFunction, Request, Response } from "express";
import { OrderItemSummaryService } from "./OrderItemSummaryService";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { NotFound, Unauthorized } from "http-errors";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";
import { mapPageHeader } from "../utils/page.header.utils";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { getBasket } from "../client/api.client";
import { BasketLink, getBasketLink } from "../utils/basket.util";

const logger = createLogger(APPLICATION_NAME);

export class OrderItemSummaryController {

    constructor (private service: OrderItemSummaryService = new OrderItemSummaryService()) {
    }

    async viewSummary (request: Request, response: Response, next: NextFunction): Promise<void> {
        const orderId = request.params.orderId;
        const itemId = request.params.itemId;
        const signInInfo = request.session?.data[SessionKey.SignInInfo];
        const apiToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        try {
            logger.debug(`Retrieving summary for order/item [${orderId}/${itemId}] for user [${userId}]...`);
            const pageHeader = mapPageHeader(request);
            const basket: Basket = await getBasket(apiToken);
            const basketLink: BasketLink = await getBasketLink(request, basket);
            const viewModel = await this.service.getOrderItem({
                orderId,
                itemId,
                apiToken
            });
            logger.debug(`Retrieved summary for order/item [${orderId}/${itemId}] for user [${userId}]`);
            return response.render(viewModel.template, { ...viewModel.data, ...pageHeader, ...basketLink })
        } catch (error) {
            if (error instanceof Unauthorized) {
                logger.info(`User [${userId}] is not authorised to retrieve summary for order/item [${orderId}/${itemId}]`);
                next();
            } else if (error instanceof NotFound) {
                logger.info(`Order/item [${orderId}/${itemId}] does not exist`);
                next();
            } else {
                logger.error(`Error displaying summary for order/item [${orderId}/${itemId}] for user [${userId}]`);
                next(error);
            }
        }
    }
}
