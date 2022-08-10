import { NextFunction, Request, Response } from "express";
import { OrderSummaryFetchable } from "./OrderSummaryService";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ERROR_UNAUTHORISED, ORDER_SUMMARY } from "../model/template.paths";
import { Unauthorized } from "http-errors";

export class OrderSummaryController {

    private service: OrderSummaryFetchable;

    constructor (service: OrderSummaryFetchable) {
        this.service = service;
    }

    async readOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const signInInfo = req.session?.data[SessionKey.SignInInfo];
            const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
            const viewModel = await this.service.fetchOrderSummary(req.params.orderId, accessToken);
            return res.render(ORDER_SUMMARY, viewModel);
        } catch (error) {
            if (error instanceof Unauthorized) {
                res.status(401);
                return res.render(ERROR_UNAUTHORISED);
            }
            next(error);
        }
    }
}
