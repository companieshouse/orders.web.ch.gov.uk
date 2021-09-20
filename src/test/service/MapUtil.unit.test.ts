import {MapUtil} from "../../service/MapUtil";
import {expect} from "chai";
import { CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { DISPATCH_DAYS } from "../../config/config";

describe("MapUtil unit tests", () => {
    describe("determineItemOptionsSelectedText", () => {
        it("item option defined returns Yes", () => {
            const result = MapUtil.determineItemOptionsSelectedText(true);
            expect(result).to.equal("Yes");
        });

        it("item option undefined returns No", () => {
            const result = MapUtil.determineItemOptionsSelectedText(undefined);
            expect(result).to.equal("No");
        });

        it('should correctly map to HTML', function () {
            // Given
            const elements = ["This is a test of inserting line breaks", "This is a new line1", "This is a new line2"];

            // When
            const result = MapUtil.mapToHtml(elements);

            // Then
            expect(result).to.equal("This is a test of inserting line breaks<br>This is a new line1<br>This is a new line2<br>")
        });

        it('should correctly escape some HTML special characters', function () {
            // Given
            const elements = ["This is a test for escaping special characters e.g. & and < and >"];

            // When
            const result = MapUtil.mapToHtml(elements);

            // Then
            expect(result).to.equal("This is a test for escaping special characters e.g. &amp; and &lt; and &gt;<br>")
        });
    });

    describe("mapCertificateType", () => {
        it("maps incorporation-with-all-name-changes to Incorporation with all company name changes", () => {
            const result = MapUtil.mapCertificateType("incorporation-with-all-name-changes");
            expect(result).to.equal("Incorporation with all company name changes");
        });

        it("maps dissolution to Dissolution with all company name changes", () => {
            const result = MapUtil.mapCertificateType("dissolution");
            expect(result).to.equal("Dissolution with all company name changes");
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
            const result = MapUtil.mapDeliveryDetails(deliveryDetails);
            expect(result).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
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
            const result = MapUtil.mapDeliveryDetails(deliveryDetails);
            expect(result).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "locality", "region", "postal code", "country"]));
        });
    });

    describe("mapDeliveryMethod", () => {
        it("map standard to Standard delivery (dispatched within the 'dispatch date config value' working days)", () => {
            const result = MapUtil.mapDeliveryMethod({deliveryTimescale: "standard"} as CertificateItemOptions);
            expect(result).to.equal("Standard delivery (aim to dispatch within " + DISPATCH_DAYS + " working days)");
        });

        it("maps same-day to Same Day", () => {
            const result = MapUtil.mapDeliveryMethod({deliveryTimescale: "same-day"} as CertificateItemOptions);
            expect(result).to.equal("Same Day");
        });
    });
});
