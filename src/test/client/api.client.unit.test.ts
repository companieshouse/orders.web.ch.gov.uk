import sinon from "sinon";
import chai from "chai";
import BasketService from "@companieshouse/api-sdk-node/dist/services/order/basket/service";
import PaymentService from "@companieshouse/api-sdk-node/dist/services/payment/service";
import { BasketLinks, Checkout } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import Resource, {
    ApiResponse,
    ApiErrorResponse
} from "@companieshouse/api-sdk-node/dist/services/resource";
import { success, failure, Success, Failure } from "@companieshouse/api-sdk-node/dist/services/result";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { Basket, BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

import {
    checkoutBasket,
    createPayment,
    getBasketLinks,
    getOrder, getOrderItem,
    getPaymentStatus,
    patchBasket,
    removeBasketItem
} from "../../client/api.client";
import { InternalServerError, NotFound } from "http-errors";
import { OrderService } from "@companieshouse/api-sdk-node/dist/services/order";
import OrderItemService, { OrderItemErrorResponse } from "@companieshouse/api-sdk-node/dist/services/order/order-item/service";
import { OrderErrorResponse } from "@companieshouse/api-sdk-node/dist/services/order/order/service";
const O_AUTH_TOKEN = "oauth";

const sandbox = sinon.createSandbox();

const dummyBasketSDKResponse: Resource<Basket> = {
    httpStatusCode: 200,
    resource: {
        deliveryDetails: {
            addressLine1: "117 kings road",
            addressLine2: "canton",
            companyName: "company name",
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
        companyName: "company name",
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

            return chai.expect(createPayment(O_AUTH_TOKEN, "http://payment-url", "1234")).to.be.rejected;
        });
    });
    describe("getPayment", () => {
        it("should return a Payment object with headers if call is successful", async () => {
            const paymentServiceResponse: ApiResponse<Payment> = {
                httpStatusCode: 200
            };
            paymentServiceResponse.resource = { reference: "orderable_item_ORD-123456-123456" } as Payment;
            sandbox.stub(PaymentService.prototype, "getPayment").returns(Promise.resolve(success(paymentServiceResponse)));

            const apiResponse: ApiResponse<Payment> = await getPaymentStatus(O_AUTH_TOKEN, "q4nn5UxZiZxVG2e");

            chai.expect(apiResponse.headers?.httpStatusCode).to.equal(paymentServiceResponse.headers?.httpStatusCode);
            chai.expect(apiResponse.resource?.reference).to.equal(paymentServiceResponse.resource.reference);
        });

        it("should throw an error if call is unsuccessful", () => {
            const paymentServiceResponse: ApiErrorResponse = {
                httpStatusCode: 404,
                errors: [{ error: "error" }]
            };
            sandbox.stub(PaymentService.prototype, "getPayment").returns(Promise.resolve(failure(paymentServiceResponse)));

            return chai.expect(getPaymentStatus(O_AUTH_TOKEN, "q4nn5UxZiZxVG2e")).to.be.rejectedWith(InternalServerError);
        });
        it("should throw a error for 401", async () => {
            const paymentServiceResponse: ApiErrorResponse = {
                httpStatusCode: 401,
                errors: [{ error: "error" }]
            };
            sandbox.stub(PaymentService.prototype, "getPayment").returns(Promise.resolve(failure(paymentServiceResponse)));
        
            await chai.expect(getPaymentStatus(O_AUTH_TOKEN, "q4nn5UxZiZxVG2e")).to.be.rejectedWith('[{"error":"error"}]');
        });
        it("should throw a error for 429", async () => {
            const paymentServiceResponse: ApiErrorResponse = {
                httpStatusCode: 429,
                errors: [{ error: "error" }]
            };
            sandbox.stub(PaymentService.prototype, "getPayment").returns(Promise.resolve(failure(paymentServiceResponse)));
        
            await chai.expect(getPaymentStatus(O_AUTH_TOKEN, "q4nn5UxZiZxVG2e")).to.be.rejectedWith('[{"error":"error"}]');
        });
        it("should reject if payment resource is undefined", async () => {
            const paymentServiceResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: undefined
            };
            sandbox.stub(PaymentService.prototype, "getPayment").returns(Promise.resolve(success(paymentServiceResponse)));
        
            await chai.expect(getPaymentStatus(O_AUTH_TOKEN, "q4nn5UxZiZxVG2e")).to.be.rejectedWith("Payment resource is undefined");
        });
    });

    describe("patchBasket", () => {
        it("returns the Basket details following PATCH basket", async () => {
            sandbox.stub(BasketService.prototype, "patchBasket").returns(Promise.resolve(dummyBasketSDKResponse));
            const patchBasketDetails = await patchBasket("oauth", basketPatchRequest);
            chai.expect(patchBasketDetails).to.equal(dummyBasketSDKResponse.resource);
        });
    });

    describe("getBasketLinks", () => {
        it("should return a basket successfully", async function () {
            const mockBasket: Resource<BasketLinks> = {
                httpStatusCode: 200,
                resource: {
                    id: "id",
                    createdAt: "createdAt",
                    updatedAt: "updatedAt",
                    data: {
                        items: [
                            {
                                itemUri: "/orderable/certificate/12345678"
                            }
                        ],
                        enrolled: true
                    }
                }
            };
            sandbox.stub(BasketService.prototype, "getBasketLinks").returns(Promise.resolve(mockBasket));
            const basketLinks = await getBasketLinks("oauth");
            chai.expect(basketLinks).to.equal(mockBasket.resource);
        });
    });

    describe("removeBasketItem", () => {
        it("should return success 200 ok", async function () {
            const response: Resource<any> = {
                httpStatusCode: 200
            };
            sandbox.stub(BasketService.prototype, "removeBasketItem").returns(Promise.resolve(response));
            const basketLinks = await removeBasketItem({ itemUri: "/orderable/certificates/12345678" }, "oauth");
            chai.expect(basketLinks.httpStatusCode).to.equal(response.httpStatusCode);
        });
    });

    describe("getOrder", () => {
        it("should return success 200 ok", async () => {
            sandbox.stub(OrderService.prototype, "getOrder").returns(Promise.resolve(new Success<any, ApiErrorResponse>({
                reference: "ORD-123456-123456"
            })));
            const order = await getOrder("ORD-123456-123456", "oauth");
            chai.expect(order.reference).to.equal("ORD-123456-123456");
        });
        it("should throw an error if error returned by getOrder endpoint", async () => {
            sandbox.stub(OrderService.prototype, "getOrder").returns(Promise.resolve(new Failure<any, OrderErrorResponse>({
                httpStatusCode: 404,
                error: "an error occurred"
            })));
            await chai.expect(getOrder("ORD-123456-123456", "oauth")).to.be.rejectedWith(NotFound);
        });
        it("should throw an internal server error if no error message and HTTP 404 returned by getOrder endpoint", async () => {
            sandbox.stub(OrderService.prototype, "getOrder").returns(Promise.resolve(new Failure<any, ApiErrorResponse>({
                httpStatusCode: 404
            })));
            await chai.expect(getOrder("ORD-123456-123456", "oauth")).to.be.rejectedWith(InternalServerError);
        });
    });

    describe("getOrderItem", () => {
        it("should return success 200 ok", async () => {
            sandbox.stub(OrderItemService.prototype, "getOrderItem").returns(Promise.resolve(new Success<any, OrderItemErrorResponse>({
                id: "MID-123456-123456"
            })));
            const item = await getOrderItem("ORD-123456-123456", "MID-123456-123456", "oauth");
            chai.expect(item.id).to.equal("MID-123456-123456");
        });
        it("should throw error with response code attached if error message returned by endpoint", async () => {
            sandbox.stub(OrderItemService.prototype, "getOrderItem").returns(Promise.resolve(new Failure<any, OrderItemErrorResponse>({
                httpStatusCode: 404,
                error: "Not found"
            })));
            await chai.expect(getOrderItem("ORD-123456-123456", "MID-123456-123456", "oauth")).to.be.rejectedWith(NotFound);
        });
        it("should throw InternalServerError if response code HTTP 404 Not Found and no error message returned by endpoint", async () => {
            sandbox.stub(OrderItemService.prototype, "getOrderItem").returns(Promise.resolve(new Failure<any, OrderItemErrorResponse>({
                httpStatusCode: 404
            })));
            await chai.expect(getOrderItem("ORD-123456-123456", "MID-123456-123456", "oauth")).to.be.rejectedWith(InternalServerError);
        });
    });
});
