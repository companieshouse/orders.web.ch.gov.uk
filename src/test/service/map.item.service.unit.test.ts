import {expect} from "chai";

import {
    mapItem

} from "../../service/map.item.service";
import {
    mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem, mockDissolvedCertificateItem
} from "../__mocks__/order.mocks";
import {DISPATCH_DAYS} from "../../config/config";

const deliveryDetails = {
    addressLine1: "address line 1",
    addressLine2: "address line 2",
    country: "country",
    forename: "forename",
    locality: "locality",
    postalCode: "postal code",
    region: "region",
    surname: "surname",
    poBox: "po box"
};

describe("map.item.service.unit", () => {
    describe("mapItem", () => {
        it("should return correct data if item is certificate", () => {
            const result = mapItem(mockCertificateItem, deliveryDetails);
            expect(result.serviceUrl).to.equal(`/company/${mockCertificateItem?.companyNumber}/orderable/certificates`);
            expect(result.serviceName).to.equal("Order a certificate");
            expect(result.titleText).to.equal("Certificate ordered");
            expect(result.pageTitle).to.equal("Certificate ordered confirmation");
            expect(result.whatHappensNextText).to.equal("We aim to send out standard orders within " + DISPATCH_DAYS + " working days. We send UK orders by Royal Mail 2nd Class post and international orders by Royal Mail International Standard post.");
            expect(result.orderDetailsTable).to.not.be.empty;
        });

        it("should return correct data if item is certificate of type dissolved", () => {
            const result = mapItem(mockDissolvedCertificateItem, deliveryDetails);
            expect(result.serviceUrl).to.equal(`/company/${mockDissolvedCertificateItem?.companyNumber}/orderable/dissolved-certificates`);
            expect(result.serviceName).to.equal("Order a certificate");
            expect(result.titleText).to.equal("Certificate ordered");
            expect(result.pageTitle).to.equal("Certificate ordered confirmation");
            expect(result.whatHappensNextText).to.equal("We aim to send out standard orders within " + DISPATCH_DAYS + " working days. We send UK orders by Royal Mail 2nd Class post and international orders by Royal Mail International Standard post.");
            expect(result.orderDetailsTable).to.not.be.empty;
        });

        it("should return correct data if item is certified copy", () => {
            const result = mapItem(mockCertifiedCopyItem, deliveryDetails);
            expect(result.serviceUrl).to.equal(`/company/${mockCertifiedCopyItem?.companyNumber}/orderable/certified-copies`);
            expect(result.serviceName).to.equal("Order a certified document");
            expect(result.titleText).to.equal("Certified document order confirmed");
            expect(result.pageTitle).to.equal("Certified document order confirmation");
            expect(result.whatHappensNextText).to.equal("We'll prepare your order and aim to dispatch it within " + DISPATCH_DAYS + " working days.");
            expect(result.orderDetailsTable).to.not.be.empty;
            expect(result.filingHistoryDocuments).to.not.be.empty;
            expect(result.documentDetailsTable).to.not.be.null;
        });

        it("should return correct data if item is missing image delivery", () => {
            const result = mapItem(mockMissingImageDeliveryItem, deliveryDetails);
            expect(result.serviceUrl).to.equal(`/company/${mockMissingImageDeliveryItem?.companyNumber}/filing-history`);
            expect(result.serviceName).to.equal("Request a document");
            expect(result.titleText).to.equal("Document Requested");
            expect(result.pageTitle).to.equal("Document Requested");
            expect(result.whatHappensNextText).to.not.be.empty;
            expect(result.orderDetailsTable).to.not.be.empty;
        });
    });
});



