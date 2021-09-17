import {ItemMapper} from "../../service/ItemMapper";
import {expect} from "chai";
import {MapUtil} from "../../service/MapUtil";
import {DISPATCH_DAYS} from "../../config/config";

describe("mapCertificateType", () => {
    it("maps incorporation-with-all-name-changes to Incorporation with all company name changes", () => {
        const result = ItemMapper.mapCertificateType("incorporation-with-all-name-changes");
        expect(result).to.equal("Incorporation with all company name changes");
    });

    it("maps dissolution to Dissolution with all company name changes", () => {
        const result = ItemMapper.mapCertificateType("dissolution");
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
        const result = ItemMapper.mapDeliveryDetails(deliveryDetails);
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
        const result = ItemMapper.mapDeliveryDetails(deliveryDetails);
        expect(result).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "locality", "region", "postal code", "country"]));
    });
});

describe("mapDeliveryMethod", () => {
    it("map standard to Standard delivery (dispatched within the 'dispatch date config value' working days)", () => {
        const result = ItemMapper.mapDeliveryMethod({deliveryTimescale: "standard"});
        expect(result).to.equal("Standard delivery (aim to dispatch within " + DISPATCH_DAYS + " working days)");
    });

    it("maps same-day to Same Day", () => {
        const result = ItemMapper.mapDeliveryMethod({deliveryTimescale: "same-day"});
        expect(result).to.equal("Same Day");
    });
});

