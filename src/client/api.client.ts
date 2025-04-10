import { createApiClient } from "@companieshouse/api-sdk-node";
import {
    Checkout as BasketCheckout,
    Basket,
    ItemUriRequest,
    BasketLinks
} from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import Resource, { ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createLogger } from "@companieshouse/structured-logging-node";
import { v4 as uuidv4 } from "uuid";
import createError, { InternalServerError } from "http-errors";

import { API_URL, APPLICATION_NAME, CHS_URL, PAYMENTS_API_URL } from "../config/config";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";
import { Item, Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";


const logger = createLogger(APPLICATION_NAME);

export const getBasket = async (oAuth: string): Promise<Basket> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<Basket> = await api.basket.getBasket();
    if (basketResource.httpStatusCode !== 200 && basketResource.httpStatusCode !== 201) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    logger.info(`Get basket, status_code=${basketResource.httpStatusCode}`);
    return basketResource.resource as Basket;
};

export const patchBasket = async (oAuth: string, basketPatchRequest: BasketPatchRequest): Promise<Basket> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<Basket> = await api.basket.patchBasket(basketPatchRequest);
    if (basketResource.httpStatusCode !== 200 && basketResource.httpStatusCode !== 201) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    logger.info(`Patch basket, status_code=${basketResource.httpStatusCode}`);
    return basketResource.resource as Basket;
};

export const checkoutBasket = async (oAuth: string): Promise<ApiResponse<BasketCheckout>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const checkoutResult:ApiResult<ApiResponse<BasketCheckout>> = await api.basket.checkoutBasket();
    if (checkoutResult.isFailure()) {
        const errorResponse = checkoutResult.value;
        logger.error(`${errorResponse?.httpStatusCode} - ${JSON.stringify(errorResponse?.errors)}`);
        if (errorResponse.httpStatusCode === 409 ||
            errorResponse.httpStatusCode === 401 ||
            errorResponse.httpStatusCode === 400) {
            throw createError(errorResponse.httpStatusCode, JSON.stringify(errorResponse?.errors?.[0]) || "Unknown Error");
        } else {
            throw createError("Unknown Error");
        }
    } else {
        logger.info(`Checkout basket, status_code=${checkoutResult.value.httpStatusCode}`);
        return checkoutResult.value;
    }
};

export const createPayment = async (oAuth: string, paymentUrl: string, checkoutId: string): Promise<ApiResponse<Payment>> => {
    const api = createApiClient(undefined, oAuth, paymentUrl);
    const redirectUri = CHS_URL + replaceOrderId(ORDER_COMPLETE, checkoutId);

    const createPaymentRequest: CreatePaymentRequest = {
        redirectUri,
        resource: `${API_URL}/basket/checkouts/${checkoutId}/payment`,
        reference: `orderable_item_${checkoutId}`,
        state: uuidv4()
    };

    const paymentResult = await api.payment.createPaymentWithFullUrl(createPaymentRequest);

    if (paymentResult.isFailure()) {
        const errorResponse = paymentResult.value;
        logger.error(`${errorResponse?.httpStatusCode} - ${JSON.stringify(errorResponse?.errors)}`);
        if (errorResponse.httpStatusCode === 401 || errorResponse.httpStatusCode === 429) {
            throw createError(errorResponse.httpStatusCode, JSON.stringify(errorResponse?.errors) || "Unknown Error");
        } else {
            throw createError("Unknown Error");
        }
    } else {
        logger.info(`Create payment, status_code=${paymentResult.value.httpStatusCode}`);
        return paymentResult.value;
    }
};


export const getPaymentStatus = async (oAuth: string, checkoutId: string): Promise<ApiResponse<Payment>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    let resource = `${PAYMENTS_API_URL}/payments/${checkoutId}`;

    const response: ApiResult<ApiResponse<Payment>>  = await api.payment.getPayment(resource);
    logger.info("Response in API client: " + JSON.stringify(response.value));


    if (response.isFailure()) {
        const errorResponse = response.value;
        logger.error(`${errorResponse?.httpStatusCode} - ${JSON.stringify(errorResponse?.errors)}`);
        if (errorResponse.httpStatusCode === 401 || errorResponse.httpStatusCode === 429) {
            throw createError(errorResponse.httpStatusCode, JSON.stringify(errorResponse?.errors) || "Unknown Error");
        } else {
            throw createError("Unknown Error");
        }
    }
    
    const paymentResource = response.value?.resource;
    if (!paymentResource) {
        return Promise.reject(new Error("Payment resource is undefined"));
    }

    return response.value
};



export const getCheckout = async (oAuth: string, checkoutId: string): Promise<ApiResponse<Checkout>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const checkoutResult: ApiResult<ApiResponse<Checkout>> = await api.checkout.getCheckout(checkoutId);
    
    if (checkoutResult.isFailure()) {
        const errorResponse = checkoutResult.value;
        logger.error(`${errorResponse?.httpStatusCode} - ${JSON.stringify(errorResponse?.errors)}`);
        if (errorResponse.httpStatusCode === 409 ||
            errorResponse.httpStatusCode === 401 ||
            errorResponse.httpStatusCode === 400) {
            throw createError(errorResponse.httpStatusCode, JSON.stringify(errorResponse?.errors?.[0]) || "Unknown Error");
        } else {
            throw createError("Unknown Error");
        }
    } else {
        logger.info(`Get checkout, status_code=${checkoutResult.value.httpStatusCode}`);
        return checkoutResult.value;
    }
};

export const getBasketLinks = async (oAuth: string): Promise<BasketLinks> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<BasketLinks> = await api.basket.getBasketLinks();
    if (basketResource.httpStatusCode !== 200) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    logger.info(`Get basket links, status_code=${basketResource.httpStatusCode}`);
    return basketResource.resource as BasketLinks;
};

export const removeBasketItem = async (itemUri: ItemUriRequest, oAuth: string): Promise<any> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const response: ApiResponse<any> = await api.basket.removeBasketItem(itemUri);
    if (response.httpStatusCode !== 200) {
        throw createError(response.httpStatusCode, response.httpStatusCode.toString());
    }
    logger.info(`Remove basket item, status code=${response.httpStatusCode}`);
    return response;
};

export const getOrder = async (orderId: string, oAuth: string): Promise<Order> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const orderResource = await api.order.getOrder(orderId);
    if (orderResource.isSuccess()) {
        return orderResource.value;
    } else {
        logger.info(`Get order, status_code=${orderResource.value.httpStatusCode}`);
        const responseCode = orderResource.value.httpStatusCode || 500;
        if (!orderResource.value.error && responseCode === 404) {
            throw new InternalServerError("Unknown error");
        } else {
            throw createError(responseCode, responseCode.toString());
        }
    }
};

export const getOrderItem = async (orderId: string, itemId: string, oAuth: string): Promise<Item> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const orderItemResource = await api.orderItem.getOrderItem(orderId, itemId);
    if (orderItemResource.isSuccess()) {
        return orderItemResource.value;
    } else {
        logger.info(`Get order, status_code=${orderItemResource.value.httpStatusCode}`);
        const responseCode = orderItemResource.value.httpStatusCode || 500;
        if (!orderItemResource.value.error && responseCode === 404) {
            throw new InternalServerError("Unknown error");
        } else {
            throw createError(responseCode, responseCode.toString());
        }
    }
};
