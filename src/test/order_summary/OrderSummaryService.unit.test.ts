import * as apiClient from "../../client/api.client";
import {
    CERTIFICATE_ID,
    CERTIFIED_COPY_ID,
    MISSING_IMAGE_DELIVERY_ID,
    mockCertificateItem,
    mockCertifiedCopyItem,
    mockMissingImageDeliveryItem,
    mockOrderResponse,
    ORDER_ID
} from "../__mocks__/order.mocks";
import sinon from "sinon";
import { OrderSummaryService } from "../../order_summary/OrderSummaryService";
import { expect } from "chai";
import { OrderSummary } from "../../order_summary/OrderSummary";
import { CHS_URL } from "../../config/config";

const sandbox = sinon.createSandbox();

describe("OrderSummaryService", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
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
                backLinkUrl: CHS_URL,
                orderReference: ORDER_ID,
                deliveryAddress: {
                    key: {
                        classes: "govuk-!-width-one-half",
                        text: "Delivery address"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='delivery-address-value'>forename surname<br>address line 1<br>address line 2<br>locality<br>region<br>postal code<br>country<br></p>"
                    }
                },
                paymentDetails: {
                    paymentReference: "1234567",
                    amountPaid: "£15"
                },
                hasDeliverableItems: true,
                itemSummary: [
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${CERTIFICATE_ID}">${CERTIFICATE_ID}</a>`},
                        {text: "Certificate"},
                        {text: "00000000"},
                        {text: "Standard"},
                        {text: "£15"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${CERTIFICATE_ID}">${CERTIFICATE_ID}</a>`},
                        {text: "Certificate"},
                        {text: "00000000"},
                        {text: "Express"},
                        {text: "£15"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${CERTIFIED_COPY_ID}">${CERTIFIED_COPY_ID}</a>`},
                        {text: "Certified document"},
                        {text: "00000000"},
                        {text: "Standard"},
                        {text: "£30"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${CERTIFIED_COPY_ID}">${CERTIFIED_COPY_ID}</a>`},
                        {text: "Certified document"},
                        {text: "00000000"},
                        {text: "Express"},
                        {text: "£30"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}">${MISSING_IMAGE_DELIVERY_ID}</a>`},
                        {text: "Missing image"},
                        {text: "00000000"},
                        {text: "N/A"},
                        {text: "£3"}
                    ]]
            } as OrderSummary);
        });

        it("Hides delivery details if no deliverable items ordered", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").returns(Promise.resolve({
                ...mockOrderResponse,
                items: [
                    {...mockMissingImageDeliveryItem},
                    {...mockMissingImageDeliveryItem}
                ]
            }));
            const service = new OrderSummaryService();

            // when
            const actual = await service.fetchOrderSummary(ORDER_ID, "F00DFACE");

            // then
            expect(actual).to.deep.equal({
                backLinkUrl: CHS_URL,
                orderReference: ORDER_ID,
                deliveryAddress: {
                    key: {
                        classes: "govuk-!-width-one-half",
                        text: "Delivery address"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='delivery-address-value'>forename surname<br>address line 1<br>address line 2<br>locality<br>region<br>postal code<br>country<br></p>"
                    }
                },
                paymentDetails: {
                    paymentReference: "1234567",
                    amountPaid: "£15"
                },
                hasDeliverableItems: false,
                itemSummary: [
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}">${MISSING_IMAGE_DELIVERY_ID}</a>`},
                        {text: "Missing image"},
                        {text: "00000000"},
                        {text: "N/A"},
                        {text: "£3"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}">${MISSING_IMAGE_DELIVERY_ID}</a>`},
                        {text: "Missing image"},
                        {text: "00000000"},
                        {text: "N/A"},
                        {text: "£3"}
                    ]]
            } as OrderSummary);
        });
    });
});
