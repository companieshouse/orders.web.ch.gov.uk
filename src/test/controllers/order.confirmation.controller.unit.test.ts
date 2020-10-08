import chai from "chai";

import { getItemTypeUrlParam } from "../../controllers/order.confirmation.controller";

describe("order.confirmation.controller.unit", () => {
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
