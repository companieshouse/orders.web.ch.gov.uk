import {OrderSummaryTemplateMapper} from "../../controllers/OrderSummaryTemplateMapper";
import {mockCertificateItem, mockMissingImageDeliveryCheckoutResponse} from "../__mocks__/order.mocks";
import {expect} from "chai";

describe("OrderSummaryTemplateMapper", () => {
    describe("map", () => {
        it("It evaluates hasMissingImageDeliveryItems to true if order has missing image delivery items", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map(mockMissingImageDeliveryCheckoutResponse);

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£3");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("07 October 2020 - 11:09:46");
            expect(actual.hasMissingImageDeliveryItems).is.true;
            expect(actual.hasExpressDeliveryItems).is.false;
            expect(actual.hasStandardDeliveryItems).is.false;
            expect(actual.templateName).equals("order-complete-abbreviated");
        });

        it("It evaluates hasExpressDeliveryItems to true if order has express delivery items", () => {
            // given
            const mapper = new OrderSummaryTemplateMapper();

            // when
            const actual = mapper.map({...mockCertificateItem, items: [{...mockCertificateItem.items[0], itemOptions: {...mockCertificateItem.items[0].itemOptions, deliveryTimescale: "same-day"}}]});

            // then
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£3");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("07 October 2020 - 11:09:46");
            expect(actual.hasMissingImageDeliveryItems).is.true;
            expect(actual.hasExpressDeliveryItems).is.false;
            expect(actual.hasStandardDeliveryItems).is.false;
            expect(actual.templateName).equals("order-complete-abbreviated");
    });
});
