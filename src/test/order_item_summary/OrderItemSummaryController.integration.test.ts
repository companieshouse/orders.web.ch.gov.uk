import ioredis from "ioredis";
import sinon from "sinon";
import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import {
    CERTIFIED_COPY_ID,
    MISSING_IMAGE_DELIVERY_ID,
    mockCertifiedCopyItem,
    mockMissingImageDeliveryItem,
    ORDER_ID
} from "../__mocks__/order.mocks";
import chai, { expect } from "chai";
import cheerio from "cheerio";
import { InternalServerError, NotFound, Unauthorized } from "http-errors";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";

let testApp;
let sandbox = sinon.createSandbox();

describe("OrderItemSummaryController", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.restore();
        sandbox.reset();
    });

    describe("viewSummary", () => {
        it("Renders a summary of a missing image delivery order", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve(mockMissingImageDeliveryItem));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(MISSING_IMAGE_DELIVERY_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(6);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("The Company");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Date");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("26 May 2015");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Type");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("AP01");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("Description");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Appointment of Mr Richard John Harris as a director");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("£3");
        });

        it("Renders a summary of a certified copy order", async () => {
            const mockItem: Item = {
                ...mockCertifiedCopyItem,
                itemOptions: {
                    ...mockCertifiedCopyItem.itemOptions,
                    filingHistoryDocuments: [{
                        filingHistoryDate: "2010-02-12",
                        filingHistoryDescription: "change-person-director-company-with-change-date",
                        filingHistoryDescriptionValues: {
                            change_date: "2010-02-12",
                            officer_name: "Thomas David Wheare"
                        },
                        filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                        filingHistoryType: "CH01",
                        filingHistoryCost: "15"
                    }]
                },
                totalItemCost: "15"
            };

            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve(mockItem));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFIED_COPY_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFIED_COPY_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(3);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Delivery method");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Standard delivery (aim to dispatch within 10 working days)");

            expect($($("#document-details-table .govuk-table__header")[0]).text()).to.contain("Date filed");
            expect($($("#document-details-table .govuk-table__cell")[0]).text()).to.contain("12 Feb 2010");
            expect($($("#document-details-table .govuk-table__header")[1]).text()).to.contain("Type");
            expect($($("#document-details-table .govuk-table__cell")[1]).text()).to.contain("CH01");
            expect($($("#document-details-table .govuk-table__header")[2]).text()).to.contain("Description");
            expect($($("#document-details-table .govuk-table__cell")[2]).text()).to.contain("Director's details changed for Thomas David Wheare on 12 February 2010");
            expect($($("#document-details-table .govuk-table__header")[3]).text()).to.contain("Fee");
            expect($($("#document-details-table .govuk-table__cell")[3]).text()).to.contain("£15");
        });


        it("Renders page not found if user not resource owner", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem").throws(Unauthorized);

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Page not found");
        });

        it("Renders page not found if item does not exist", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem").throws(NotFound);

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(404);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Page not found");
        });

        it("Renders error page if resource unavailable", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem").throws(InternalServerError);

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${MISSING_IMAGE_DELIVERY_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            // then
            const $ = cheerio.load(response.text);
            chai.expect(response.status).to.equal(500);
            chai.expect($(".govuk-heading-xl").text()).to.contain("Sorry, there is a problem with the service");
        });
    });
});