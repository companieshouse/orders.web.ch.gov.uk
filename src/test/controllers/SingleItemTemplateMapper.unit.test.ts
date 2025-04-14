import {
    mockCertificateCheckoutResponse,
    mockCertifiedCopyCheckoutResponse,
    mockMissingImageDeliveryCheckoutResponse,
    mockPaymentResponseReferenceMapped
} from "../__mocks__/order.mocks";
import {
    CERTIFICATE_PAGE_TITLE,
    CERTIFIED_COPY_PAGE_TITLE, MID_PAGE_TITLE,
} from "../../controllers/ConfirmationTemplateMapper";
import { expect } from "chai";
import { ORDER_COMPLETE } from "../../model/template.paths";
import {SingleItemTemplateMapper} from "../../controllers/SingleItemTemplateMapper";

describe("SingleItemTemplateMapper", () => {
    describe("map", () => {
        it("Maps a checkout object containing a certificate item to a view object", () => {
            // given
            const mapper = new SingleItemTemplateMapper();

            // when
            const actual: any = mapper.map(mockCertificateCheckoutResponse,mockPaymentResponseReferenceMapped);

            // then
            expect(actual.serviceName).equals("Order a certificate");
            expect(actual.companyNumber).equals("00000000");
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£15");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.itemKind).equals("item#certificate");
            expect(actual.piwikLink).equals("certificates");
            expect(actual.totalItemsCost).equals("£15");
            expect(actual.templateName).equals(ORDER_COMPLETE);
            expect(actual.pageTitleText).equals(CERTIFICATE_PAGE_TITLE);
        });
        it("Maps a checkout object containing a certified copy item to a view object", () => {
            // given
            const mapper = new SingleItemTemplateMapper();

            // when
            const actual: any = mapper.map(mockCertifiedCopyCheckoutResponse,mockPaymentResponseReferenceMapped);

            // then
            expect(actual.serviceName).equals("Order a certified document");
            expect(actual.companyNumber).equals("00000000");
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£30");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.itemKind).equals("item#certified-copy");
            expect(actual.piwikLink).equals("certified-copies");
            expect(actual.totalItemsCost).equals("£30");
            expect(actual.templateName).equals(ORDER_COMPLETE);
            expect(actual.pageTitleText).equals(CERTIFIED_COPY_PAGE_TITLE);
        });
        it("Maps a checkout object containing a missing image delivery item to a view object", () => {
            // given
            const mapper = new SingleItemTemplateMapper();

            // when
            const actual: any = mapper.map(mockMissingImageDeliveryCheckoutResponse,mockPaymentResponseReferenceMapped);

            // then
            expect(actual.serviceName).equals("Request a document");
            expect(actual.companyNumber).equals("00000000");
            expect(actual.orderDetails.referenceNumber).equals("ORD-123456-123456");
            expect(actual.orderDetails.referenceNumberAriaLabel).equals("ORD hyphen 123456 hyphen 123456");
            expect(actual.paymentDetails.amount).equals("£3");
            expect(actual.paymentDetails.paymentReference).equals("q4nn5UxZiZxVG2e");
            expect(actual.paymentDetails.orderedAt).equals("16 December 2019 - 09:16:17");
            expect(actual.itemKind).equals("item#missing-image-delivery");
            expect(actual.piwikLink).is.empty;
            expect(actual.totalItemsCost).equals("£3");
            expect(actual.templateName).equals(ORDER_COMPLETE);
            expect(actual.pageTitleText).equals(MID_PAGE_TITLE);
        });

    });
});
