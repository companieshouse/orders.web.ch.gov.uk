import { createApiClient } from "@companieshouse/api-sdk-node";
import { Checkout as BasketCheckout, Basket, CheckoutResource } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
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
