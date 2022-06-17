import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { BASKET, ORDER_COMPLETE, ORDERS, replaceOrderId } from "../model/page.urls";

const logger = createLogger(APPLICATION_NAME);

const REDIRECTS_WHITELIST = {};
REDIRECTS_WHITELIST[ORDERS] = ORDERS;
REDIRECTS_WHITELIST[ORDER_COMPLETE] = ORDER_COMPLETE;
REDIRECTS_WHITELIST[BASKET] = BASKET;

export default (req: Request, res: Response, next: NextFunction) => {
    // TODO GCI-2127 We probably will not need to log these?
    logger.info(`req.originalUrl = ${req.originalUrl}`);
    logger.info(`req.params = ${JSON.stringify(req.params)}`);
    logger.info(`req.query = ${JSON.stringify(req.query)}`);

    if (!req.session) {
        logger.debug(`${req.url}: Session object is missing!`);
    }
    const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

    if (!signedIn) {
        const redirection = `/signin?return_to=${getWhitelistedReturnToURL(req)}`;
        logger.info(`User unauthorized, status_code=401, Redirecting to: ${redirection}`);
        return res.redirect(redirection);
    } else {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        logger.info(`User is signed in, user_id=${userId}`);
    }
    next();
};

export const getWhitelistedReturnToURL = (req: Request) => {
    const returnToUrl = req.originalUrl;
    logger.info(`Looking up return to URL ${returnToUrl} in whitelist.`);
    if (returnToUrl in REDIRECTS_WHITELIST) {
        logger.info(`Found return to URL ${returnToUrl} in whitelist.`);
        return REDIRECTS_WHITELIST[returnToUrl];
    } else if (returnToUrl.startsWith(ORDERS) && returnToUrl.length > ORDERS.length) {
        return rebuildOrderCompleteURL(req);
    } else {
        const error = `Return to URL ${returnToUrl} not found in trusted URLs whitelist ${JSON.stringify(REDIRECTS_WHITELIST)}.`;
        logger.error(error);
        throw new Error(error);
    }
};

const rebuildOrderCompleteURL = (req: Request) => {
    const queryString = Object.keys.length > 0
        ? "?" + Object.keys(req.query).map(key => key + "=" + req.query[key]).join("&") : "";
    const orderCompleteURL = replaceOrderId(ORDER_COMPLETE, getWellFormedOrderId3(req)) + queryString;
    logger.info(`Rebuilt order complete URL = ${orderCompleteURL}`);
    return orderCompleteURL;
};

// FAIL - Sonar still sees this as a critical security vulnerability.
const getWellFormedOrderId = (req: Request) => {
    const wellFormedOrderId = /ORD-\d{6}-\d{6}/;
    if (wellFormedOrderId.test(req.params.orderId)) {
        return req.params.orderId;
    } else {
        const error = `req.params.orderId ${req.params.orderId} is not a valid order ID`;
        logger.error(error);
        throw new Error(error);
    }
};

// getWellFormedOrderId2 gets the order ID indirectly by extracting it from the reference parameter.
// - PASS according to Sonar.
const getWellFormedOrderId2 = (req: Request) => {
    const wellFormedOrderId = /ORD-\d{6}-\d{6}/;
    const reference = req.query.ref;
    if (reference !== null && reference !== undefined && typeof reference === "string") {
        const extractedOrderIds = reference.match(wellFormedOrderId);
        if (extractedOrderIds !== null && extractedOrderIds.length > 0) {
            return extractedOrderIds[0];
        }
    }
    const error = `Unable to extract order Id from ref parameter ${reference}`;
    logger.error(error);
    throw new Error(error);
};

// getWellFormedOrderId3 gets the order ID indirectly by extracting it from req.params.orderId via a regex match.
const getWellFormedOrderId3 = (req: Request) => {
    const wellFormedOrderId = /ORD-\d{6}-\d{6}/;
    const orderId = req.params.orderId;
    if (orderId !== null && orderId !== undefined) {
        const extractedOrderIds = orderId.match(wellFormedOrderId);
        if (extractedOrderIds !== null && extractedOrderIds.length > 0) {
            return extractedOrderIds[0];
        }
    }
    const error = `Unable to extract order Id from orderId path parameter ${orderId}`;
    logger.error(error);
    throw new Error(error);
};
