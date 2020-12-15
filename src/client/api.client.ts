import { createApiClient } from "@companieshouse/api-sdk-node";
import { Checkout, Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { Order } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import Resource, { ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createLogger } from "ch-structured-logging";
import { v4 as uuidv4 } from "uuid";
import createError from "http-errors";

import { API_URL, APPLICATION_NAME, CHS_URL } from "../config/config";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";

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

export const checkoutBasket = async (oAuth: string): Promise<ApiResponse<Checkout>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const checkoutResult:ApiResult<ApiResponse<Checkout>> = await api.basket.checkoutBasket();
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

export const getOrder = async (oAuth: string, orderId: string): Promise<Order> => {
    return retryGetOrder(oAuth, orderId);
};

/*
The order does not get created straight away which is why there is a retry method if the order is not found
*/
const retryGetOrder = async (oAuth: string, orderId: string, retriesLeft: number = 3, interval: number = 1000): Promise<Order> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const orderResult:ApiResult<Order> = await api.order.getOrder(orderId);
    if (orderResult.isFailure()) {
        const errorResponse = orderResult.value;
        if (errorResponse.httpStatusCode === 404) {
            if (retriesLeft >= 0) {
                logger.info(`failed to get order, order_id=${orderId}, retries=${retriesLeft}`);
                await new Promise(resolve => setTimeout(resolve, interval));
                return retryGetOrder(oAuth, orderId, retriesLeft - 1, interval);
            } else {
                throw createError(404, JSON.stringify(errorResponse?.errors) || "Unknown Error");
            }
        } else if (errorResponse.httpStatusCode === 401) {
            // throw 401 error as 404, so user does not know it exists
            logger.error(`user is unauthorized to view order, status_code=${errorResponse.httpStatusCode}, order_id=${orderId}`);
            throw createError(404, JSON.stringify(errorResponse?.errors) || "Unknown Error");
        } else {
            throw createError("Unknown Error");
        }
    } else {
        return orderResult.value;
    };
};
