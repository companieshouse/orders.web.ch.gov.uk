import { expect } from "chai";
import { getWhitelistedReturnToURL } from "../../middleware/auth.middleware";
import { ORDERS, ORDER_COMPLETE, BASKET } from "../../model/page.urls";
const UNKNOWN_URL = "/unknown";

describe("auth.middleware.unit", () => {
    // TODO GCI-2127 Restore these tests.
    // describe("getWhitelistedReturnToURL", () => {
    //     it("gets correct return to URL for orders page", () => {
    //         const returnToUrl = getWhitelistedReturnToURL(ORDERS);
    //         expect(returnToUrl).to.equal(ORDERS);
    //     });
    //
    //     it("gets correct return to URL for order complete page", () => {
    //         const returnToUrl = getWhitelistedReturnToURL(ORDER_COMPLETE);
    //         expect(returnToUrl).to.equal(ORDER_COMPLETE);
    //     });
    //
    //     it("gets correct return to URL for basket page", () => {
    //         const returnToUrl = getWhitelistedReturnToURL(BASKET);
    //         expect(returnToUrl).to.equal(BASKET);
    //     });
    //
    //     it("errors if asked to look up an unknown page URL", () => {
    //         const execution = () => getWhitelistedReturnToURL(UNKNOWN_URL);
    //         expect(execution).to.throw("Return to URL /unknown not found in trusted URLs whitelist " +
    //             "{\"/orders\":\"/orders\",\"/orders/:orderId/confirmation\":\"/orders/:orderId/confirmation\"," +
    //             "\"/basket\":\"/basket\"}.");
    //     });
    // });
});
