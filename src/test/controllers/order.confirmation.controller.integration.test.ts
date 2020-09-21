import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { Order } from "ch-sdk-node/dist/services/order/order";
import { Basket } from "ch-sdk-node/dist/services/order/basket";
import cheerio from "cheerio";

import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getOrderStub;
let getBasketStub;

const ORDER_ID = "ORD-123456-123456";
const ORDER_ID_ARIA_LABEL = "ORD hyphen 123456 hyphen 123456";
const CERTIFICATE_ID = "CRT-123456-123456";
const CERTIFIED_COPY_ID = "CCD-123456-123456";

const ITEM_KINDS = [{
    kind: "item#certificate",
    name: "certificate",
    url: "/orderable/certificates/CRT-123456-123456"
},
{
    kind: "item#certified-copy",
    name: "certified-copy",
    url: "/orderable/certified-copies/CCD-123456-123456"
}];

const mockCertificateOrderResponse: Order = {
    orderedAt: "2019-12-16T09:16:17.791Z",
    orderedBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`
    },
    paymentReference: "1234567",
    etag: "abcdefghijk123456789",
    deliveryDetails: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "country",
        forename: "forename",
        locality: "locality",
        postalCode: "postal code",
        region: "region",
        surname: "surname",
        poBox: "po box"
    },
    items: [{
        id: CERTIFICATE_ID,
        companyName: "Company Name",
        companyNumber: "00000000",
        description: "certificate for company 00000000",
        descriptionIdentifier: "certificate",
        descriptionValues: {
            certificate: "certificate for company 00000000",
            companyNumber: "00000000"
        },
        itemCosts: [{
            discountApplied: "0",
            itemCost: "15",
            calculatedCost: "15",
            productType: "certificate"
        }],
        itemOptions: {
            certificateType: "incorporation-with-all-name-changes",
            deliveryMethod: "postal",
            deliveryTimescale: "standard",
            directorDetails: {},
            forename: "forename",
            includeGoodStandingInformation: true,
            registeredOfficeAddressDetails: {},
            secretaryDetails: {},
            surname: "surname"
        },
        etag: "abcdefg123456",
        kind: "item#certificate",
        links: {
            self: "/orderable/certificates/" + CERTIFICATE_ID
        },
        postalDelivery: true,
        quantity: 1,
        itemUri: "/orderable/certificates/" + CERTIFICATE_ID,
        status: "unknown",
        postageCost: "0",
        totalItemCost: "15",
        customerReference: "mycert",
        satisfiedAt: "2020-05-15T08:41:05.798Z"
    }
    ],
    kind: "order",
    totalOrderCost: "15",
    reference: ORDER_ID
};

const mockCertifiedCopyOrderResponse: Order = {
    orderedAt: "2019-12-16T09:16:17.791Z",
    orderedBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`
    },
    paymentReference: "1234567",
    etag: "abcdefghijk123456789",
    deliveryDetails: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "country",
        forename: "forename",
        locality: "locality",
        postalCode: "postal code",
        region: "region",
        surname: "surname",
        poBox: "po box"
    },
    items: [{
        id: CERTIFICATE_ID,
        companyName: "Company Name",
        companyNumber: "00000000",
        description: "certified-copy for company 00000000",
        descriptionIdentifier: "certified-copy",
        descriptionValues: {
            certificate: "certified-copy for company 00000000",
            companyNumber: "00000000"
        },
        itemCosts: [{
            discountApplied: "0",
            itemCost: "30",
            calculatedCost: "30",
            productType: "certified-copy"
        }],
        itemOptions: {
            deliveryMethod: "postal",
            deliveryTimescale: "standard",
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
            },
            {
                filingHistoryDate: "2009-03-12",
                filingHistoryDescription: "accounts-with-accounts-type-group",
                filingHistoryDescriptionValues: {
                    made_up_date: "2008-08-31"
                },
                filingHistoryId: "MjAzNTYyNTE5M2FkaXF6a2N4",
                filingHistoryType: "AA",
                filingHistoryCost: "15"
            }
            ]
        },
        etag: "abcdefg123456",
        kind: "item#certified-copy",
        links: {
            self: "/orderable/certified-copies/" + CERTIFIED_COPY_ID
        },
        postalDelivery: true,
        quantity: 1,
        itemUri: "/orderable/certified-copies/" + CERTIFIED_COPY_ID,
        status: "unknown",
        postageCost: "0",
        totalItemCost: "30",
        customerReference: "mycert",
        satisfiedAt: "2020-05-15T08:41:05.798Z"
    }
    ],
    kind: "order",
    totalOrderCost: "30",
    reference: ORDER_ID
};

describe("order.confirmation.controller.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders get order page on successful get order call for a certificate order", (done) => {
        getOrderStub = sandbox.stub(apiClient, "getOrder").returns(Promise.resolve(mockCertificateOrderResponse));

        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certificate`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                const $ = cheerio.load(resp.text);

                chai.expect(resp.status).to.equal(200);
                chai.expect($("#orderReference").text()).to.equal(mockCertificateOrderResponse.reference);
                chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                chai.expect($("#companyNameValue").text()).to.equal(mockCertificateOrderResponse.items[0].companyName);
                chai.expect($("#companyNumberValue").text()).to.equal(mockCertificateOrderResponse.items[0].companyNumber);
                chai.expect($("#certificateTypeValue").text()).to.equal("Incorporation with all company name changes");
                chai.expect($("#includedOnCertificateValue").html()).to.equal("Statement of good standing");
                chai.expect($("#deliveryMethodValue").text()).to.equal("Standard delivery (aim to dispatch within 4 working days)");
                chai.expect($("#deliveryAddressValue").html()).to.equal("forename surname<br>address line 1<br>address line 2<br>locality<br>region<br>postal code<br>country<br>");
                chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                chai.expect($("#paymentReferenceValue").text()).to.equal(mockCertificateOrderResponse.paymentReference);
                chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                chai.expect(getOrderStub).to.have.been.called;
                chai.expect(resp.text).to.not.contain("Your document details");
                done();
            });
    });

    it("renders get order page on successful get order call for a certified copy order", async () => {
        getOrderStub = sandbox.stub(apiClient, "getOrder").returns(Promise.resolve(mockCertifiedCopyOrderResponse));

        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certified-copy`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        const $ = cheerio.load(resp.text);

        chai.expect(resp.status).to.equal(200);
        chai.expect($("#orderReference").text()).to.equal(mockCertifiedCopyOrderResponse.reference);
        chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
        chai.expect($("#companyNameValue").text()).to.equal(mockCertifiedCopyOrderResponse.items[0].companyName);
        chai.expect($("#companyNumberValue").text()).to.equal(mockCertifiedCopyOrderResponse.items[0].companyNumber);
        chai.expect($("#deliveryMethodValue").text()).to.equal("Standard delivery (aim to dispatch within 4 working days)");
        chai.expect($("#deliveryAddressValue").html()).to.equal("forename surname<br>address line 1<br>address line 2<br>locality<br>region<br>postal code<br>country<br>");
        chai.expect($("#filingHistoryDateValue1").text().trim()).to.equal("12 Feb 2010");
        chai.expect($("#filingHistoryTypeValue1").text().trim()).to.equal("CH01");
        chai.expect($("#filingHistoryDescriptionValue1").text().trim()).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
        chai.expect($("#filingHistoryFeeValue1").text().trim()).to.equal("£15");
        chai.expect($("#filingHistoryDateValue2").text().trim()).to.equal("12 Mar 2009");
        chai.expect($("#filingHistoryTypeValue2").text().trim()).to.equal("AA");
        chai.expect($("#filingHistoryDescriptionValue2").text().trim()).to.equal("Group of companies' accounts made up to 31 August 2008");
        chai.expect($("#filingHistoryFeeValue2").text().trim()).to.equal("£15");
        chai.expect($("#paymentAmountValue").text()).to.equal("£30");
        chai.expect($("#paymentReferenceValue").text()).to.equal(mockCertifiedCopyOrderResponse.paymentReference);
        chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
        chai.expect(resp.text).to.not.contain("certificateTypeValue");
        chai.expect(resp.text).to.not.contain("includedOnCertificateValue");
        chai.expect(getOrderStub).to.have.been.called;
    });

    it.skip("renders an error page if get order fails", (done) => {
        getOrderStub = sandbox.stub(apiClient, "checkoutBasket").throws(new Error("ERROR"));
        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.status).to.equal(500);
                done();
            });
    });

    ITEM_KINDS.forEach((itemKind) => {
        const basketCancelledFailedResponse = {
            deliveryDetails: {
                addressLine1: "117 kings road",
                addressLine2: "canton",
                country: "wales",
                forename: "John",
                locality: "Cardiff",
                poBox: "po box",
                postalCode: "CF5 3NB",
                region: "Glamorgan",
                surname: "Smith"
            },
            etag: "etag",
            items: [{
                itemOptions: { key: {} },
                itemUri: itemKind.url,
                kind: itemKind.kind,
                links: { self: itemKind.url }
            }]
        } as unknown as Basket;

        it("redirects to " + itemKind.name + " check details page if status is cancelled and item type is " + itemKind.name, async () => {
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketCancelledFailedResponse));
            const resp = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=cancelled&itemType=certified-copy`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);
            chai.expect(resp.text).to.include(`${itemKind.url}/check-details`);
        });

        it("redirects to " + itemKind.name + " check details page if status is failed and item type is " + itemKind.name, async () => {
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketCancelledFailedResponse));
            const resp = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=failed&itemType=certified-copy`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);
            chai.expect(resp.text).to.include(`${itemKind.url}/check-details`);
        });
    });
});
