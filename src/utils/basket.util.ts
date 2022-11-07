import { Request } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { BASKET_WEB_URL } from "../config/config";

export interface BasketLink {
    showBasketLink: boolean
    basketWebUrl?: string
    basketItems?: number
}

export const getBasketLink = async (req: Request, basket: Basket) : Promise<BasketLink> => {
    const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;
    if (!signedIn) {
        return { showBasketLink: false };
    }
    const signInInfo = req.session?.data[SessionKey.SignInInfo];
    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;

    return { showBasketLink: basket.enrolled, basketWebUrl: BASKET_WEB_URL, basketItems: basket.items?.length };
};