import { OrderSummaryController } from "../../order_summary/OrderSummaryController";
import sinon from "sinon";
import {
    mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem,
    mockOrderResponse
} from "../__mocks__/order.mocks";
import ioredis from "ioredis";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import * as apiClient from "../../client/api.client";
import chai from "chai";
import cheerio from "cheerio";
import { InternalServerError, NotFound, Unauthorized } from "http-errors";

let testApp;
let sandbox = sinon.createSandbox();

describe("OrderSummaryController", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("readOrder", () => {
        it("Renders template with order reference, item details, delivery address and payment details", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").returns(Promise.resolve({
                ...mockOrderResponse,
                items: [
                    { ...mockCertificateItem },
                    { ...mockCertificateItem, itemOptions: {...mockCertificateItem.itemOptions, deliveryTimescale: "same-day"} },
                    { ...mockCertifiedCopyItem },
                    { ...mockCertifiedCopyItem, itemOptions: {...mockCertifiedCopyItem.itemOptions, deliveryTimescale: "same-day"} },
                    { ...mockMissingImageDeliveryItem }
                ]
            }));

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            chai.expect(response.status).to.equal(200);
            chai.expect($("#itemSummary tbody tr").length).to.equal(5);
            chai.expect($("#order-reference").text()).to.equal("ORD-123456-123456");
            chai.expect($("#delivery-address-value").text()).to.contain("forename");
            chai.expect($("#delivery-address-value").text()).to.contain("surname");
            chai.expect($("#delivery-address-value").text()).to.contain("address line 1");
            chai.expect($("#delivery-address-value").text()).to.contain("address line 2");
            chai.expect($("#delivery-address-value").text()).to.contain("locality");
            chai.expect($("#delivery-address-value").text()).to.contain("region");
            chai.expect($("#delivery-address-value").text()).to.contain("postal code");
            chai.expect($("#delivery-address-value").text()).to.contain("country");
            chai.expect($("#subtotal-list").text()).to.contain("1234567");
            chai.expect($("#subtotal-list").text()).to.contain("£15");
        });

        it("Hides delivery details if no items with postal delivery requested", async() => {
            // given
            sandbox.stub(apiClient, "getOrder").returns(Promise.resolve({
                ...mockOrderResponse,
                items: [
                    { ...mockMissingImageDeliveryItem },
                    { ...mockMissingImageDeliveryItem }
                ]
            }));

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            chai.expect(response.status).to.equal(200);
            chai.expect($("#itemSummary tbody tr").length).to.equal(2);
            chai.expect($("#order-reference").text()).to.equal("ORD-123456-123456");
            chai.expect($("#delivery-address-value").length).to.equal(0);
            chai.expect($("#subtotal-list").text()).to.contain("1234567");
            chai.expect($("#subtotal-list").text()).to.contain("£15");
        });

        it("Renders Not Found if getOrder endpoint returns HTTP 401 Unauthorized", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").throws(Unauthorized);

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Page not found");
        });
        it("Renders Not Found if getOrder endpoint returns HTTP 404 Not Found", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").throws(NotFound);

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Page not found");
        });
        it("Renders Service Unavailable if getOrder endpoint returns other error response codes", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").throws(InternalServerError);

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Sorry, there is a problem with the service");
        });
    });
})
