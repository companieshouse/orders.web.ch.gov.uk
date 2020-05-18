import { createApiClient } from "ch-sdk-node";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";
import { Order } from "ch-sdk-node/dist/services/order/order";
import { CreatePaymentRequest, Payment } from "ch-sdk-node/dist/services/payment";
import { ApiResponse, ApiResult } from "ch-sdk-node/dist/services/resource";
import { createLogger } from "ch-structured-logging";
import { v4 as uuidv4 } from "uuid";

import { API_URL, APPLICATION_NAME, CHS_URL } from "../config/config";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";

const logger = createLogger(APPLICATION_NAME);

export const checkoutBasket = async (oAuth: string): Promise<ApiResponse<Checkout>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const checkoutResult:ApiResult<ApiResponse<Checkout>> = await api.basket.checkoutBasket();
    if (checkoutResult.isFailure()) {
        const errorResponse = checkoutResult.value;
        logger.error(`${errorResponse?.httpStatusCode} - ${JSON.stringify(errorResponse?.errors)}`);
        if (errorResponse.httpStatusCode === 409 ||
            errorResponse.httpStatusCode === 401 ||
            errorResponse.httpStatusCode === 400) {
            throw new Error(JSON.stringify(errorResponse?.errors) || "Unknown Error");
        } else {
            throw new Error("Unknown Error");
        }
    } else {
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
            throw new Error(JSON.stringify(errorResponse?.errors) || "Unknown Error");
        } else {
            throw new Error("Unknown Error");
        }
    } else {
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
            if (retriesLeft) {
                await new Promise(resolve => setTimeout(resolve, interval));
                return retryGetOrder(oAuth, orderId, retriesLeft - 1, interval);
            } else {
                throw new Error(JSON.stringify(errorResponse?.errors) || "Unknown Error");
            }
        } else if (errorResponse.httpStatusCode === 401) {
            throw new Error(JSON.stringify(errorResponse?.errors) || "Unknown Error");
        } else {
            throw new Error("Unknown Error");
        }
    } else {
        return orderResult.value;
    };
};
