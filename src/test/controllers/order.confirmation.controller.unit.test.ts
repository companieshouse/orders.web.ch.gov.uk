import chai from "chai";

import { getItemTypeUrlParam, mapCertificateType, mapDate, mapIncludedOnCertificate } from "../../controllers/order.confirmation.controller";
import { mapDeliveryDetails, mapDeliveryMethod, mapFilingHistoryDate } from "../../utils/check.details.utils";

describe("order.confirmation.controller.unit", () => {
    describe("mapCertificateType", () => {
        it("maps incorporation-with-all-name-changes to Incorporation with all company name changes", () => {
            const result = mapCertificateType("incorporation-with-all-name-changes");
            chai.expect(result).to.equal("Incorporation with all company name changes");
        });
    });

    describe("mapDate", () => {
        it("maps am date correctly", () => {
            const result = mapDate("2019-12-16T09:16:17.791Z");
            chai.expect(result).to.equal("16 December 2019 - 09:16:17");
        });

        it("maps pm date correctly", () => {
            const result = mapDate("2019-12-16T13:16:17.791Z");
            chai.expect(result).to.equal("16 December 2019 - 13:16:17");
        });

        it("maps date with minutes and seconds less than 10 correctly", () => {
            const result = mapDate("2019-12-16T13:06:07.791Z");
            chai.expect(result).to.equal("16 December 2019 - 13:06:07");
        });
    });

    describe("mapFilingHistoryDate", () => {
        it("maps short month date correctly", () => {
            const result = mapFilingHistoryDate("2009-12-23");
            chai.expect(result).to.equal("23 Dec 2009");
        });
    });

    describe("mapAddress", () => {
        it("maps full delivery details correctly", () => {
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
            const result = mapDeliveryDetails(deliveryDetails);
            chai.expect(result).to.equal("forename surname<br>address line 1<br>address line 2<br>locality<br>region<br>postal code<br>country<br>");
        });
        it("maps full delivery details correctly", () => {
            const deliveryDetails = {
                addressLine1: "address line 1",
                forename: "forename",
                postalCode: "postal code",
                region: "region",
                surname: "surname",
                country: "country",
                locality: "locality"
            };
            const result = mapDeliveryDetails(deliveryDetails);
            chai.expect(result).to.equal("forename surname<br>address line 1<br>locality<br>region<br>postal code<br>country<br>");
        });
    });

    describe("mapDeliveryMethod", () => {
        it("map standard to Standard delivery (dispatched within 4 working days)", () => {
            const result = mapDeliveryMethod({ deliveryTimescale: "standard" });
            chai.expect(result).to.equal("Standard delivery (aim to dispatch within 4 working days)");
        });

        it("maps same-day to Same Day", () => {
            const result = mapDeliveryMethod({ deliveryTimescale: "same-day" });
            chai.expect(result).to.equal("Same Day");
        });
    });

    describe("mapIncludedOnCertificate", () => {
        it("map all included on certificate correctly", () => {
            const itemOptions = {
                directorDetails: {
                    includeBasicInformation: true
                },
                includeCompanyObjectsInformation: true,
                includeGoodStandingInformation: true,
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: "current"
                },
                secretaryDetails: {
                    includeBasicInformation: true
                }
            };
            const result = mapIncludedOnCertificate(itemOptions);
            chai.expect(result).to.equal("Statement of good standing<br/>Registered office address<br/>Directors<br/>Secretaries<br/>Company objects");
        });

        it("map some included on certificate correctly", () => {
            const itemOptions = {
                directorDetails: {
                    includeBasicInformation: false
                },
                includeCompanyObjectsInformation: true,
                includeGoodStandingInformation: false,
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: ""
                },
                secretaryDetails: {
                    includeBasicInformation: true
                }
            };
            const result = mapIncludedOnCertificate(itemOptions);
            chai.expect(result).to.equal("Secretaries<br/>Company objects");
        });
    });

    describe("getItemTypeUrlParam", () => {
        it("get itemType for certificate correctly", () => {
            const result = getItemTypeUrlParam("item#certificate");
            chai.expect(result).to.equal("&itemType=certificate");
        });

        it("get itemType for certified-copies correctly", () => {
            const result = getItemTypeUrlParam("item#certified-copy");
            chai.expect(result).to.equal("&itemType=certified-copy");
        });

        it("get itemType for missing-image-delivery correctly", () => {
            const result = getItemTypeUrlParam("item#missing-image-delivery");
            chai.expect(result).to.equal("&itemType=missing-image-delivery");
        });
    });
});
