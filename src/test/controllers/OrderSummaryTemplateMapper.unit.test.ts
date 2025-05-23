import { OrderSummaryTemplateMapper } from "../../controllers/OrderSummaryTemplateMapper";
import {
    mockCertificateCheckoutResponse,
    mockCertifiedCopyCheckoutResponse, mockCertifiedCopyItem,
    mockMissingImageDeliveryCheckoutResponse, mockMissingImageDeliveryItem,
    mockPaymentResponseReferenceMapped
} from "../__mocks__/order.mocks";
import { expect } from "chai";

describe("OrderSummaryTemplateMapper", () => {
    describe("map", () => {
        it("It evaluates hasMissingImageDeliveryItems to true if order has missing image delivery items", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map(mockMissingImageDeliveryCheckoutResponse,mockPaymentResponseReferenceMapped);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£3");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.hasMissingImageDeliveryItems).is.true;
            expect(actual.hasExpressDeliveryItems).is.false;
            expect(actual.hasStandardDeliveryItems).is.false;
            expect(actual.deliveryDetailsTable).to.be.undefined;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });

        it("It evaluates hasExpressDeliveryItems to true if order has a certificate with express delivery", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map({
                ...mockCertificateCheckoutResponse,
                items: [{
                    ...mockCertificateCheckoutResponse.items[0],
                    itemOptions: {
                        ...mockCertificateCheckoutResponse.items[0].itemOptions,
                        deliveryTimescale: "same-day"
                    }
                }]},mockPaymentResponseReferenceMapped);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£15");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.hasMissingImageDeliveryItems).is.false;
            expect(actual.hasExpressDeliveryItems).is.true;
            expect(actual.hasStandardDeliveryItems).is.false;
            expect(actual.deliveryDetailsTable).to.not.be.undefined;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });

        it("It evaluates hasExpressDeliveryItems to true if order has a certified copy with express delivery", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map({
                ...mockCertifiedCopyCheckoutResponse,
                items: [{
                    ...mockCertifiedCopyCheckoutResponse.items[0],
                    itemOptions: {
                        ...mockCertifiedCopyCheckoutResponse.items[0].itemOptions,
                        deliveryTimescale: "same-day"
                    }
                }]
            },mockPaymentResponseReferenceMapped);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£30");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.hasMissingImageDeliveryItems).is.false;
            expect(actual.hasExpressDeliveryItems).is.true;
            expect(actual.hasStandardDeliveryItems).is.false;
            expect(actual.deliveryDetailsTable).to.not.be.undefined;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });

        it("It evaluates hasStandardDeliveryItems to true if order has a certificate with standard delivery", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map(mockCertificateCheckoutResponse,mockPaymentResponseReferenceMapped);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£15");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.hasMissingImageDeliveryItems).is.false;
            expect(actual.hasExpressDeliveryItems).is.false;
            expect(actual.hasStandardDeliveryItems).is.true;
            expect(actual.deliveryDetailsTable).to.not.be.undefined;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });

        it("It evaluates hasStandardDeliveryItems to true if order has a certified copy with standard delivery", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map(mockCertifiedCopyCheckoutResponse,mockPaymentResponseReferenceMapped);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£30");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.hasMissingImageDeliveryItems).is.false;
            expect(actual.hasExpressDeliveryItems).is.false;
            expect(actual.hasStandardDeliveryItems).is.true;
            expect(actual.deliveryDetailsTable).to.not.be.undefined;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });

        it("It evaluates hasMissingImageDeliveryItems, hasExpressDeliveryItems and hasStandardDeliveryItems to true if order has missing image deliveries, items with standard, express delivery", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map({
                ...mockCertificateCheckoutResponse,
                items: [
                    { ...mockCertificateCheckoutResponse.items[0] },
                    { ...mockMissingImageDeliveryItem },
                    { ...mockCertifiedCopyItem, itemOptions: { ...mockCertifiedCopyItem.itemOptions, deliveryTimescale: "same-day" } }
                ],
            },mockPaymentResponseReferenceMapped);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£15");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.hasMissingImageDeliveryItems).is.true;
            expect(actual.hasExpressDeliveryItems).is.true;
            expect(actual.hasStandardDeliveryItems).is.true;
            expect(actual.deliveryDetailsTable).to.not.be.undefined;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });
    });
});
