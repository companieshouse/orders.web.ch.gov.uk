import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order";
import * as apiClient from "../../client/api.client";
import chai, { expect } from "chai";
import sinon from "sinon";

import { getRedirectUrl, retryGetCheckout } from "../../controllers/order.confirmation.controller";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem, mockDissolvedCertificateItem, mockCertificateCheckoutResponse, ACCESS_TOKEN, ORDER_ID } from "../__mocks__/order.mocks";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { InternalServerError, NotFound } from "http-errors";

describe("order.confirmation.controller.unit", () => {
    describe("getRedirectUrl", () => {
        it("return a redirect url correctly", () => {
            const basketItem = {
                items: [{
                    itemUri: "/o",
                    kind: "item#certified-copies",
                    links: { self: "item#certified-copy" },
                    itemId: "CRT-123456-123456"
                }]
            } as unknown as BasketItem;

            const result = getRedirectUrl(basketItem, "itemId");
            chai.expect(result).to.contain("/check-details");
        });
    });

    it("return a redirect url for a dissolution correctly", () => {
        const basketItem = {
            items: [{
                itemOptions: {
                    certificateType: "dissolution"
                },
                itemUri: "/orderable/certificates",
                kind: "item#certificate",
                links: { self: "item#certificate" },
                itemId: "CRT-123456-123456"
            }]
        } as unknown as BasketItem;

        const result = getRedirectUrl(basketItem, "itemId");
        chai.expect(result).to.contain("/check-details");
    });

    describe("retry checkout", async () => {
        it("Polling successful if paidAt and paymentReference available", async () => {
            const sandbox = sinon.createSandbox();
            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: mockCertificateCheckoutResponse
            }
            sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));

            const result = await retryGetCheckout(ACCESS_TOKEN, ORDER_ID);
            expect(result.success).to.be.true;
            expect(result.data?.paidAt).equals(mockCertificateCheckoutResponse.paidAt);
            expect(result.data?.paymentReference).equals(mockCertificateCheckoutResponse.paymentReference);

            sandbox.reset();
            sandbox.restore();
        });

        it("Polling unsuccessful if paidAt and paymentReference unavailable", async () => {
            const sandbox = sinon.createSandbox();
            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: {
                    ...mockCertificateCheckoutResponse,
                    paidAt: undefined,
                    paymentReference: undefined
                }
            }
            sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));

            const result = await retryGetCheckout(ACCESS_TOKEN, ORDER_ID);
            expect(result.success).to.be.false;
            expect(result.data).to.be.undefined;

            sandbox.reset();
            sandbox.restore();
        });

        it("Polling unsuccessful if getCheckout endpoint returns error", async () => {
            const sandbox = sinon.createSandbox();
            sandbox.stub(apiClient, "getCheckout").throws(InternalServerError);

            const result = await retryGetCheckout(ACCESS_TOKEN, ORDER_ID);
            expect(result.success).to.be.false;
            expect(result.data).to.be.undefined;

            sandbox.reset();
            sandbox.restore();
        });
    });
});
