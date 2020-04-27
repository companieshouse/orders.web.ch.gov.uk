import { NextFunction, Request, Response } from "express";
import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../config/config";

const logger = createLogger(APPLICATION_NAME);

export default (req: Request, res: Response, next: NextFunction) => {
    req.session.ifNothing(() => logger.info(`${req.url}: Session object is missing!`));
    const signedIn: boolean = req.session
        .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
        .map((signInInfo: ISignInInfo) => signInInfo[SignInInfoKeys.SignedIn] === 1)
        .orDefault(false);

    if (!signedIn) {
        return res.redirect(`/signin?return_to=/basket`);
    }

    next();
};
