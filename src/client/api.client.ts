import { createApiClient } from "ch-sdk-node";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";
import { CreatePaymentRequest, Payment } from "ch-sdk-node/dist/services/payment";
import { ApiResponse, ApiErrorResponse, ApiResult } from "ch-sdk-node/dist/services/resource";
import { createLogger } from "ch-structured-logging";
import { v4 as uuidv4 } from "uuid";

import { API_URL, APPLICATION_NAME, CHS_URL } from "../config/config";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";

const logger = createLogger(APPLICATION_NAME);

export const checkoutBasket = async (oAuth: string): Promise<ApiResponse<Checkout>> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const checkoutResult:ApiResult<ApiResponse<Checkout>> = await api.basket.checkoutBasket();

    if (checkoutResult.isFailure()) {
        const checkoutResource = checkoutResult.value;
        logger.error(`${checkoutResource?.httpStatusCode} - ${JSON.stringify(checkoutResource?.errors)}`);
        if (checkoutResource.httpStatusCode === 409 ||
            checkoutResource.httpStatusCode === 401 ||
            checkoutResource.httpStatusCode === 400) {
            throw new Error(JSON.stringify(checkoutResource?.errors) || "Unknown Error");
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
        const paymentResource = paymentResult.value;
        logger.error(`${paymentResource?.httpStatusCode} - ${JSON.stringify(paymentResource?.errors)}`);
        if (paymentResource.httpStatusCode === 401 || paymentResource.httpStatusCode === 429) {
            throw new Error(JSON.stringify(paymentResource?.errors) || "Unknown Error");
        } else {
            throw new Error("Unknown Error");
        }
    } else {
        return paymentResult.value;
    }
};
