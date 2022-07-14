import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order";
import * as apiClient from "../../client/api.client";
import chai, { expect } from "chai";
import sinon from "sinon";

import { getItemTypeUrlParam, getRedirectUrl, retryGetCheckout } from "../../controllers/order.confirmation.controller";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem, mockDissolvedCertificateItem, mockCertificateCheckoutResponse, ACCESS_TOKEN, ORDER_ID } from "../__mocks__/order.mocks";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";

describe("order.confirmation.controller.unit", () => {
    describe("getItemTypeUrlParam", () => {
        it("get itemType for certificate correctly", () => {
            const result = getItemTypeUrlParam(mockCertificateItem);
            chai.expect(result).to.equal("&itemType=certificate");
        });

        it("get itemType for dissolved certificate correctly", () => {
            const result = getItemTypeUrlParam(mockDissolvedCertificateItem);
            chai.expect(result).to.equal("&itemType=dissolved-certificate");
        });

        it("get itemType for certified-copies correctly", () => {
            const result = getItemTypeUrlParam(mockCertifiedCopyItem);
            chai.expect(result).to.equal("&itemType=certified-copy");
        });

        it("get itemType for missing-image-delivery correctly", () => {
            const result = getItemTypeUrlParam(mockMissingImageDeliveryItem);
            chai.expect(result).to.equal("&itemType=missing-image-delivery");
        });
    });

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

    it("retry checkout", async () => {
        const sandbox = sinon.createSandbox();
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockCertificateCheckoutResponse
        }
        const getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        const mockCheckoutResponse = mockCertificateCheckoutResponse;

        const result = await retryGetCheckout(ACCESS_TOKEN, ORDER_ID);
        expect(result[0]).to.equal(mockCheckoutResponse.paidAt)
        expect(result[1]).to.equal(mockCheckoutResponse.paymentReference);

        sandbox.reset();
        sandbox.restore();
    });
});
