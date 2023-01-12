import ioredis from "ioredis";
import sinon from "sinon";
import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import {
    CERTIFICATE_ID,
    CERTIFIED_COPY_ID,
    MISSING_IMAGE_DELIVERY_ID,
    mockCertificateItem,
    mockCertifiedCopyItem,
    mockMissingImageDeliveryItem,
    ORDER_ID
} from "../__mocks__/order.mocks";
import chai, { expect } from "chai";
import cheerio from "cheerio";
import { InternalServerError, NotFound, Unauthorized } from "http-errors";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { verifyUserNavBarRenderedWithoutBasketLink } from "../utils/page.header.utils.test";

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
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Standard (aim to send out within 10 working days)");

            expect($($("#document-details-table .govuk-table__header")[0]).text()).to.contain("Date filed");
            expect($($("#document-details-table .govuk-table__cell")[0]).text()).to.contain("12 Feb 2010");
            expect($($("#document-details-table .govuk-table__header")[1]).text()).to.contain("Type");
            expect($($("#document-details-table .govuk-table__cell")[1]).text()).to.contain("CH01");
            expect($($("#document-details-table .govuk-table__header")[2]).text()).to.contain("Description");
            expect($($("#document-details-table .govuk-table__cell")[2]).text()).to.contain("Director's details changed for Thomas David Wheare on 12 February 2010");
            expect($($("#document-details-table .govuk-table__header")[3]).text()).to.contain("Fee");
            expect($($("#document-details-table .govuk-table__cell")[3]).text()).to.contain("£15");
        });


        it("Renders a summary of a certificate order for an active limited company", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "active"
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(11);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Statement of good standing");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("Registered office address");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Current address and the one previous");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current company directors");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("The names of all current secretaries");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("Company objects");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[10]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[10]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for an administrated limited company", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        registeredOfficeAddressDetails: {
                            includeAddressRecordsType: "current"
                        },
                        directorDetails: {
                        },
                        secretaryDetails: {
                        },
                        companyStatus: "administration",
                        administratorsDetails: {
                            includeBasicInformation: true
                        },
                        deliveryTimescale: "same-day",
                        includeEmailCopy: true
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(11);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Registered office address");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Current address");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("The names of all current company directors");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current secretaries");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("Company objects");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("Administrators' details");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("Express (Orders received before 11am will be sent out the same day. Orders received after 11am will be sent out the next working day)");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[10]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[10]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for a liquidated limited company", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        registeredOfficeAddressDetails: {
                            includeAddressRecordsType: "current-previous-and-prior"
                        },
                        directorDetails: {
                            includeBasicInformation: true,
                            includeAddress: true,
                            includeAppointmentDate: true,
                            includeCountryOfResidence: true,
                            includeDobType: "partial",
                            includeNationality: true,
                            includeOccupation: true
                        },
                        secretaryDetails: {
                            includeBasicInformation: true,
                            includeAddress: true,
                            includeAppointmentDate: true
                        },
                        companyStatus: "liquidation",
                        liquidatorsDetails: {
                            includeBasicInformation: true
                        },
                        includeCompanyObjectsInformation: true
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(11);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Registered office address");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Current address and the two previous");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("The names of all current company directors");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Including directors':");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Correspondence address");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Occupation");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Date of birth (month and year)");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Appointment date");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Nationality");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Country of residence");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current secretaries");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Including secretaries':");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Correspondence address");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Appointment date");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("Company objects");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("Liquidators' details");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[10]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[10]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for a dissolved limited company", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        certificateType: "dissolution",
                        companyStatus: "dissolved"
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(6);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Dissolution with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for an active LLP", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        registeredOfficeAddressDetails: {
                            includeAddressRecordsType: "all"
                        },
                        designatedMemberDetails: {
                            includeBasicInformation: true,
                            includeAddress: false,
                            includeAppointmentDate: false,
                            includeCountryOfResidence: false
                        },
                        memberDetails: {
                            includeBasicInformation: true,
                            includeAddress: false,
                            includeAppointmentDate: false,
                            includeCountryOfResidence: false
                        },
                        companyStatus: "active",
                        companyType: "llp"
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(10);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Statement of good standing");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("Registered office address");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("All current and previous addresses");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current designated members");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("The names of all current members");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for an administrated LLP", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        registeredOfficeAddressDetails: {
                            includeAddressRecordsType: "current"
                        },
                        designatedMemberDetails: {
                        },
                        memberDetails: {
                        },
                        companyStatus: "administration",
                        companyType: "llp",
                        administratorsDetails: {
                            includeBasicInformation: true
                        },
                        deliveryTimescale: "same-day",
                        includeEmailCopy: false
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(10);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Registered office address");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Current address");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("The names of all current designated members");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current members");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("Administrators' details");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("Express (Orders received before 11am will be sent out the same day. Orders received after 11am will be sent out the next working day)");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("No");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for a liquidated LLP", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        registeredOfficeAddressDetails: {
                            includeAddressRecordsType: "current-previous-and-prior"
                        },
                        designatedMemberDetails: {
                            includeBasicInformation: true,
                            includeDobType: "partial",
                            includeCountryOfResidence: true,
                            includeAppointmentDate: true,
                            includeAddress: true
                        },
                        memberDetails: {
                            includeBasicInformation: true,
                            includeDobType: "partial",
                            includeCountryOfResidence: true,
                            includeAppointmentDate: true,
                            includeAddress: true
                        },
                        companyStatus: "liquidation",
                        companyType: "llp",
                        liquidatorsDetails: {
                            includeBasicInformation: true
                        }
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(10);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Registered office address");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Current address and the two previous");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("The names of all current designated members");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Including designated members':");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Correspondence address");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Appointment date");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Country of residence");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Date of birth (month and year)");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current members");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Including members':");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Correspondence address");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Appointment date");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Country of residence");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Date of birth (month and year)");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("Liquidators' details");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for a dissolved LLP", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        certificateType: "dissolution",
                        companyStatus: "dissolved",
                        companyType: "llp"
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(6);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Dissolution with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("£15");
        });

        it("Renders a summary of a certificate order for an active limited partnership", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve({
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        principalPlaceOfBusinessDetails: {
                            includeAddressRecordsType: "current"
                        },
                        generalPartnerDetails: {
                            includeBasicInformation: true
                        },
                        limitedPartnerDetails: {
                            includeBasicInformation: true
                        },
                        includeGeneralNatureOfBusinessInformation: true,
                        companyStatus: "active",
                        companyType: "limited-partnership"
                    }
                }));

            // when
            const response = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/items/${CERTIFICATE_ID}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(response.text);

            // then
            expect(response.status).to.equal(200);
            expect($("#item-reference").text()).to.contain(CERTIFICATE_ID);
            expect($("#item-details-list .govuk-summary-list__row").length).to.equal(11);
            expect($($("#item-details-list .govuk-summary-list__key")[0]).text()).to.contain("Company name");
            expect($($("#item-details-list .govuk-summary-list__value")[0]).text()).to.contain("Company Name");
            expect($($("#item-details-list .govuk-summary-list__key")[1]).text()).to.contain("Company number");
            expect($($("#item-details-list .govuk-summary-list__value")[1]).text()).to.contain("00000000");
            expect($($("#item-details-list .govuk-summary-list__key")[2]).text()).to.contain("Certificate type");
            expect($($("#item-details-list .govuk-summary-list__value")[2]).text()).to.contain("Incorporation with all company name changes");
            expect($($("#item-details-list .govuk-summary-list__key")[3]).text()).to.contain("Statement of good standing");
            expect($($("#item-details-list .govuk-summary-list__value")[3]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[4]).text()).to.contain("Principal place of business");
            expect($($("#item-details-list .govuk-summary-list__value")[4]).text()).to.contain("Current address");
            expect($($("#item-details-list .govuk-summary-list__key")[5]).text()).to.contain("The names of all current general partners");
            expect($($("#item-details-list .govuk-summary-list__value")[5]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[6]).text()).to.contain("The names of all current limited partners");
            expect($($("#item-details-list .govuk-summary-list__value")[6]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[7]).text()).to.contain("General nature of business");
            expect($($("#item-details-list .govuk-summary-list__value")[7]).text()).to.contain("Yes");
            expect($($("#item-details-list .govuk-summary-list__key")[8]).text()).to.contain("Dispatch method");
            expect($($("#item-details-list .govuk-summary-list__value")[8]).text()).to.contain("Standard (aim to send out within 10 working days)");
            expect($($("#item-details-list .govuk-summary-list__key")[9]).text()).to.contain("Email copy required");
            expect($($("#item-details-list .govuk-summary-list__value")[9]).text()).to.contain("Email only available for express dispatch");
            expect($($("#item-details-list .govuk-summary-list__key")[10]).text()).to.contain("Fee");
            expect($($("#item-details-list .govuk-summary-list__value")[10]).text()).to.contain("£15");
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

        it("Renders error page with user nav bar if orders API is down", async () => {
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
            verifyUserNavBarRenderedWithoutBasketLink(response.text);
        });
    });
});
