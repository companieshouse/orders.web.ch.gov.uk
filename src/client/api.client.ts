import { createApiClient } from "ch-sdk-node";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";
import Resource from "ch-sdk-node/dist/services/resource";

import { API_URL } from "../config/config";

export const checkoutBasket = async (oAuth: string): Promise<Checkout> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const checkoutResource: Resource<Checkout> = await api.basket.checkoutBasket();
    if (checkoutResource.httpStatusCode !== 200 && checkoutResource.httpStatusCode !== 202) {
        throw {
          status: checkoutResource.httpStatusCode,
        };
    }
    return checkoutResource.resource as Checkout;
};