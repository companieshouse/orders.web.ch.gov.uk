import { NextFunction, Request, Response } from "express";
import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { Session } from "ch-node-session-handler/lib/session/model/Session";

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== "/") {
        // tslint:disable-next-line
        req.session.ifNothing(() => console.log(`${req.url}: Session object is missing!`));
        const signedIn: boolean = req.session
                .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
                .map((signInInfo: ISignInInfo) => signInInfo[SignInInfoKeys.SignedIn] === 1)
                .orDefault(false);

        if (!signedIn) {
            return res.redirect(`/signin?return_to=/basket`);
        }
    }
    next();
};
