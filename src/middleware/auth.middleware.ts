import { NextFunction, Request, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";

const logger = createLogger(APPLICATION_NAME);

export default (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
        logger.debug(`${req.url}: Session object is missing!`);
    }
    const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

    if (!signedIn) {
        logger.info(`User unauthorized, status_code=401, Redirecting to: /signin?return_to=/basket`);
        return res.redirect(`/signin?return_to=${req.originalUrl}`);
    } else {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        logger.info(`User is signed in, user_id=${userId}`);
    }
    next();
};
