import { Request } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { BASKET_ITEM_LIMIT, BASKET_WEB_URL } from "../config/config";
import { BasketLimit, BasketLimitState } from "../model/BasketLimit";

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


export const getBasketLimit = (basketLink: BasketLink) : BasketLimit => {
    if (!basketLink.showBasketLink) {
        return { basketLimit: BASKET_ITEM_LIMIT, basketLimitState: BasketLimitState.BELOW_LIMIT };
    }

    return {
        basketLimit: BASKET_ITEM_LIMIT,
        basketLimitState: basketLink.basketItems! < BASKET_ITEM_LIMIT ?
            BasketLimitState.BELOW_LIMIT : BasketLimitState.DISPLAY_LIMIT_WARNING
    };
}