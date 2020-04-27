import { NextFunction, Request, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo, IAccessToken } from "ch-node-session-handler/lib/session/model/SessionInterfaces";

import { checkoutBasket } from "../client/api.client";
import { BLANK } from "../model/template.paths";

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signInInfo = req.session
            .map((_) => _.getValue<ISignInInfo>(SessionKey.SignInInfo))
            .unsafeCoerce();

        const accessToken = signInInfo
            .map((info) => info[SignInInfoKeys.AccessToken])
            .map((token: IAccessToken) => token.access_token as string)
            .unsafeCoerce();

        const resp = await checkoutBasket(accessToken);

        res.render(BLANK, { templateName: BLANK });
    } catch (err) {
        next(err);
    }
};
