import chai from "chai";

import { getItemTypeUrlParam } from "../../controllers/order.confirmation.controller";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";

describe("order.confirmation.controller.unit", () => {
    describe("getItemTypeUrlParam", () => {
        it("get itemType for certificate correctly", () => {
            const result = getItemTypeUrlParam(mockCertificateItem);
            chai.expect(result).to.equal("&itemType=certificate");
        });

        it("get itemType for dissolved certificate correctly", () => {

            const mockDissolved = mockCertificateItem;
            mockDissolved.itemOptions =  {
                certificateType: "dissolved",
                deliveryMethod: "postal",
                deliveryTimescale: "standard",
                directorDetails: {},
                forename: "forename",
                includeGoodStandingInformation: true,
                registeredOfficeAddressDetails: {},
                secretaryDetails: {},
                surname: "surname"
            }

            const result = getItemTypeUrlParam(mockDissolved);
            chai.expect(result).to.equal("&itemType=dissolved-certificate");
        });

        it("get itemType for certified-copies correctly", () => {
            const result = getItemTypeUrlParam(mockCertifiedCopyItem);
            chai.expect(result).to.equal("&itemType=certified-copy");
        });

        it("get itemType for missing-image-delivery correctly", () => {
            const result = getItemTypeUrlParam(mockMissingImageDeliveryItem);
            chai.expect(result).to.equal("&itemType=missing-image-delivery");
        });
    });
});
