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

import { API_URL, APPLICATION_NAME, CHS_URL } from "../config/config";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";
import { Item, Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { RefreshTokenService } from "service/RefreshToken";
import { PaymentStatus } from "model/PaymentStatus";


const logger = createLogger(APPLICATION_NAME);
var refreshTokenService: RefreshTokenService; 

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

export const validatePaymentSession = async (oAuth: string, checkoutId: string) => {
        const redirectUri = CHS_URL + replaceOrderId(ORDER_COMPLETE, checkoutId);
        let resource = `${API_URL}/basket/checkouts/${checkoutId}/payment`;
        const api = createApiClient(undefined, oAuth, API_URL);

    
   
        const paymentResult = await api.payment.getPayment(resource);
        // const paymentResourceUri = `${API_URL}/transactions/${transactionId}/${PAYMENT}`;
        // Check if the SDK call was successful
        console.log("Payment Result:", paymentResult);
};

//Then the payment details required for that render to be successful are validated directly with the payments API using the query parameters contained 
// in the payments API redirect back to any confirmation page
//And the payment details required for that render 
// to be successful are no longer validated with the order record in the orders.checkout collection

export const getPaymentStatus = async (oAuth: string, checkoutId: string, refreshToken: string): Promise<ApiResponse<Payment>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    let resource = `${API_URL}/basket/checkouts/${checkoutId}/payment`;

    const response: ApiResult<ApiResponse<Payment>>  = await api.payment.getPayment(resource);
    logger.info("Response in API client: " + JSON.stringify(response.value));


    if (response.isFailure()) {
        const errorResponse = response.value;
        if (errorResponse?.httpStatusCode === 401 || errorResponse?.httpStatusCode === 403) {
            logger.info(`Payment API get payment status request failed with: ${errorResponse.httpStatusCode} - Refreshing access token`);
            const newAccessToken: string = await refreshTokenService.refresh(oAuth, refreshToken);
            if (newAccessToken) {
                logger.info(`Access token successfully refreshed`);
                return getPaymentStatus(newAccessToken, checkoutId, refreshToken);
            }
        }

        return Promise.reject(
            new Error(`Failed to verify payment status - status: ${errorResponse?.httpStatusCode}, error: ${errorResponse?.errors}`)
        );
    }
    
    const paymentResource = response.value?.resource;
    if (!paymentResource) {
        return Promise.reject(new Error("Payment resource is undefined"));
    }

    return response.value;
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
