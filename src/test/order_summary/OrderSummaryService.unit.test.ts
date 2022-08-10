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
                itemSummary: [
                    [
                        {html: `<a class="govuk-link" href="javascript:void(0)">${CERTIFICATE_ID}</a>`},
                        {text: "00000000"},
                        {text: "Certificate"},
                        {text: "Standard"},
                        {text: "£15"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="javascript:void(0)">${CERTIFICATE_ID}</a>`},
                        {text: "00000000"},
                        {text: "Certificate"},
                        {text: "Express"},
                        {text: "£15"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="javascript:void(0)">${CERTIFIED_COPY_ID}</a>`},
                        {text: "00000000"},
                        {text: "Certified document"},
                        {text: "Standard"},
                        {text: "£30"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="javascript:void(0)">${CERTIFIED_COPY_ID}</a>`},
                        {text: "00000000"},
                        {text: "Certified document"},
                        {text: "Express"},
                        {text: "£30"}
                    ],
                    [
                        {html: `<a class="govuk-link" href="javascript:void(0)">${MISSING_IMAGE_DELIVERY_ID}</a>`},
                        {text: "00000000"},
                        {text: "Missing image"},
                        {text: "N/A"},
                        {text: "£3"}
                    ]]
            } as OrderSummary);
        });
    });
});
