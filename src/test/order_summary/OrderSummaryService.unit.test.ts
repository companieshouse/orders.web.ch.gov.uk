import * as apiClient from "../../client/api.client";
import {
    CERTIFICATE_ID, CERTIFIED_COPY_ID, MISSING_IMAGE_DELIVERY_ID,
    mockCertificateItem,
    mockCertifiedCopyItem, mockMissingImageDeliveryItem,
    mockOrderResponse,
    ORDER_ID
} from "../__mocks__/order.mocks";
import sinon from "sinon";
import { OrderSummaryService } from "../../order_summary/OrderSummaryService";
import { expect } from "chai";
import { OrderSummary } from "../../order_summary/OrderSummary";

const sandbox = sinon.createSandbox();

describe("OrderSummaryService", () => {
    afterEach(() => {
        sandbox.reset();
    });
    describe("fetchOrderSummary", () => {
        it("Returns a mapped order summary object", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").returns(Promise.resolve({
                ...mockOrderResponse,
                items: [{...mockCertificateItem},
                    {...mockCertificateItem, itemOptions: {...mockCertificateItem.itemOptions, deliveryTimescale: "same-day"}},
                    {...mockCertifiedCopyItem},
                    {...mockCertifiedCopyItem, itemOptions: {...mockCertifiedCopyItem.itemOptions, deliveryTimescale: "same-day"}},
                    {...mockMissingImageDeliveryItem}]
            }));
            const service = new OrderSummaryService();

            // when
            const actual = await service.fetchOrderSummary(ORDER_ID, "F00DFACE");

            // then
            expect(actual).to.deep.equal({
                orderReference: ORDER_ID,
                deliveryAddress: {
                    addressLine1: "address line 1",
                    addressLine2: "address line 2",
                    country: "country",
                    forename: "forename",
                    locality: "locality",
                    postalCode: "postal code",
                    region: "region",
                    surname: "surname",
                    poBox: "po box"
                },
                paymentDetails: {
                    paymentReference: "1234567",
                    amountPaid: "£15"
                },
                itemSummary: [{
                    itemNumber: CERTIFICATE_ID,
                    companyNumber: "00000000",
                    orderType: "Certificate",
                    deliveryMethod: "Standard",
                    fee: "£15"
                },
                {
                    itemNumber: CERTIFICATE_ID,
                    companyNumber: "00000000",
                    orderType: "Certificate",
                    deliveryMethod: "Express",
                    fee: "£15"
                },
                {
                    itemNumber: CERTIFIED_COPY_ID,
                    companyNumber: "00000000",
                    orderType: "Certified document",
                    deliveryMethod: "Standard",
                    fee: "£30"
                },
                {
                    itemNumber: CERTIFIED_COPY_ID,
                    companyNumber: "00000000",
                    orderType: "Certified document",
                    deliveryMethod: "Express",
                    fee: "£30"
                },
                {
                    itemNumber: MISSING_IMAGE_DELIVERY_ID,
                    companyNumber: "00000000",
                    orderType: "Missing image",
                    deliveryMethod: "N/A",
                    fee: "£3"
                }]
            } as OrderSummary);
        });
    });
});
