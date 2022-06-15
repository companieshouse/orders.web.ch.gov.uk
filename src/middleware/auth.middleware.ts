import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { BASKET, ORDER_COMPLETE, ORDERS } from "../model/page.urls";

const logger = createLogger(APPLICATION_NAME);

const REDIRECTS_WHITELIST = {};
REDIRECTS_WHITELIST[ORDERS] = ORDERS;
REDIRECTS_WHITELIST[ORDER_COMPLETE] = ORDER_COMPLETE;
REDIRECTS_WHITELIST[BASKET] = BASKET;

export default (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
        logger.debug(`${req.url}: Session object is missing!`);
    }
    const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

    if (!signedIn) {
        const redirection = `/signin?return_to=${getWhitelistedReturnToURL(req.originalUrl)}`;
        logger.info(`User unauthorized, status_code=401, Redirecting to: ${redirection}`);
        return res.redirect(redirection);
    } else {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        logger.info(`User is signed in, user_id=${userId}`);
    }
    next();
};

export const getWhitelistedReturnToURL = (returnToUrl: string) => {
    logger.info(`Looking up return to URL ${returnToUrl} in whitelist.`);
    if (returnToUrl in REDIRECTS_WHITELIST) {
        logger.info(`Found return to URL ${returnToUrl} in whitelist.`);
        return REDIRECTS_WHITELIST[returnToUrl];
    } else {
        const error = `Return to URL ${returnToUrl} not found in trusted URLs whitelist ${JSON.stringify(REDIRECTS_WHITELIST)}.`;
        logger.error(error);
        throw new Error(error);
    }
};
