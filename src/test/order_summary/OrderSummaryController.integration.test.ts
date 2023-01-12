import sinon from "sinon";
import {
    MISSING_IMAGE_DELIVERY_ID,
    mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem,
    mockOrderResponse, ORDER_ID
} from "../__mocks__/order.mocks";
import ioredis from "ioredis";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import * as apiClient from "../../client/api.client";
import chai from "chai";
import cheerio from "cheerio";
import { InternalServerError, NotFound, Unauthorized } from "http-errors";
import { getDummyBasket } from "../utils/basket.util.test";
import { verifyUserNavBarRenderedWithoutBasketLink } from "../utils/page.header.utils.test";

let testApp;
let sandbox = sinon.createSandbox();
let getBasketStub;

describe("OrderSummaryController", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").resolves();
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);
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
            sandbox.stub(apiClient, "getOrder").resolves({
                ...mockOrderResponse,
                items: [
                    { ...mockCertificateItem },
                    { ...mockCertificateItem, itemOptions: {...mockCertificateItem.itemOptions, deliveryTimescale: "same-day"} },
                    { ...mockCertifiedCopyItem },
                    { ...mockCertifiedCopyItem, itemOptions: {...mockCertifiedCopyItem.itemOptions, deliveryTimescale: "same-day"} },
                    { ...mockMissingImageDeliveryItem }
                ]
            });

            getBasketStub = sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));

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
            chai.expect(getBasketStub).to.have.been.called;
            chai.expect(response.text).to.contain( "Basket (1)" );
            
        });

        it("Hides delivery details if no items with postal delivery requested", async() => {
            // given
            sandbox.stub(apiClient, "getOrder").resolves({
                ...mockOrderResponse,
                items: [
                    { ...mockMissingImageDeliveryItem },
                    { ...mockMissingImageDeliveryItem }
                ]
            });

            getBasketStub = sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));

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
            chai.expect(getBasketStub).to.have.been.called;
            chai.expect(response.text).to.contain( "Basket (1)" );
        });

        it("Renders Not Found if getOrder endpoint returns HTTP 401 Unauthorized", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").throws(Unauthorized);
            getBasketStub = sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Sorry, there is a problem with the service");
            chai.expect(getBasketStub).to.have.been.called;
        });
        it("Renders Not Found if getOrder endpoint returns HTTP 404 Not Found", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").throws(NotFound);
            getBasketStub = sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Sorry, there is a problem with the service");
            chai.expect(getBasketStub).to.have.been.called;
        });

        it("Renders error page with user nav bar if orders API is down", async () => {
            // given
            sandbox.stub(apiClient, "getOrder").throws(NotFound);
            getBasketStub = sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));

            // when
            const response = await chai.request(testApp)
                .get("/orders/ORD-123456-123456")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Page not found");
            chai.expect(getBasketStub).to.have.been.called;

            verifyUserNavBarRenderedWithoutBasketLink(response.text);
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
});
