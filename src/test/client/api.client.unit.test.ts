import sinon from "sinon";
import chai from "chai";
import BasketService from "@companieshouse/api-sdk-node/dist/services/order/basket/service";
import PaymentService from "@companieshouse/api-sdk-node/dist/services/payment/service";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import Resource, { ApiResponse, ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { success, failure } from "@companieshouse/api-sdk-node/dist/services/result";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { Basket, BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

import { checkoutBasket, createPayment, patchBasket } from "../../client/api.client";
const O_AUTH_TOKEN = "oauth";

const sandbox = sinon.createSandbox();

const dummyBasketSDKResponse: Resource<Basket> = {
    httpStatusCode: 200,
    resource: {
        deliveryDetails: {
            addressLine1: "117 kings road",
            addressLine2: "canton",
            country: "wales",
            forename: "John",
            locality: "Cardiff",
            poBox: "po box",
            postalCode: "CF5 3NB",
            region: "Glamorgan",
            surname: "Smith"
        },
        enrolled: false
    }
};

const basketPatchRequest: BasketPatchRequest = {
    deliveryDetails: {
        addressLine1: "117 kings road",
        addressLine2: "canton",
        country: "wales",
        forename: "John",
        locality: "Cardiff",
        poBox: "po box",
        postalCode: "CF5 3NB",
        region: "Glamorgan",
        surname: "Smith"
    }
};

describe("api.client", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("checkoutBasket", () => {
        it("should return a Checkout object with headers if call is successful", async () => {
            const checkoutServiceResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                headers: {
                    "X-Payment-Required": "http://"
                }
            };
            checkoutServiceResponse.resource = { reference: "1234" } as Checkout;
            sandbox.stub(BasketService.prototype, "checkoutBasket").returns(Promise.resolve(success(checkoutServiceResponse)));

            const apiResponse: ApiResponse<Checkout> = await checkoutBasket(O_AUTH_TOKEN);

            chai.expect(apiResponse.headers?.httpStatusCode).to.equal(checkoutServiceResponse.headers?.httpStatusCode);
            chai.expect(apiResponse.headers?.["X-Payment-Required"]).to.equal(checkoutServiceResponse.headers?.["X-Payment-Required"]);
            chai.expect(apiResponse.resource?.reference).to.equal(checkoutServiceResponse.resource.reference);
        });

        it("should throw an error if call is unsuccessful", () => {
            const checkoutServiceResponse: ApiErrorResponse = {
                httpStatusCode: 400,
                errors: [{ error: "error" }]
            };
            sandbox.stub(BasketService.prototype, "checkoutBasket").returns(Promise.resolve(failure(checkoutServiceResponse)));

            return chai.expect(checkoutBasket(O_AUTH_TOKEN)).to.be.rejected;
        });
    });

    describe("createPayment", () => {
        it("should return a Payment object with headers if call is successful", async () => {
            const paymentServiceResponse: ApiResponse<Payment> = {
                httpStatusCode: 200
            };
            paymentServiceResponse.resource = { reference: "1234" } as Payment;
            sandbox.stub(PaymentService.prototype, "createPaymentWithFullUrl").returns(Promise.resolve(success(paymentServiceResponse)));

            const apiResponse: ApiResponse<Payment> = await createPayment(O_AUTH_TOKEN, "http://payment-url", "1234");

            chai.expect(apiResponse.headers?.httpStatusCode).to.equal(paymentServiceResponse.headers?.httpStatusCode);
            chai.expect(apiResponse.resource?.reference).to.equal(paymentServiceResponse.resource.reference);
        });

        it("should throw an error if call is unsuccessful", () => {
            const checkoutServiceResponse: ApiErrorResponse = {
                httpStatusCode: 400,
                errors: [{ error: "error" }]
            };
            sandbox.stub(PaymentService.prototype, "createPaymentWithFullUrl").returns(Promise.resolve(failure(checkoutServiceResponse)));

            return chai.expect(checkoutBasket(O_AUTH_TOKEN)).to.be.rejected;
        });
    });
    describe("patchBasket", () => {
        it("returns the Basket details following PATCH basket", async () => {
            sandbox.stub(BasketService.prototype, "patchBasket").returns(Promise.resolve(dummyBasketSDKResponse));
            const patchBasketDetails = await patchBasket("oauth", basketPatchRequest);
            chai.expect(patchBasketDetails).to.equal(dummyBasketSDKResponse.resource);
        });
    });
});
