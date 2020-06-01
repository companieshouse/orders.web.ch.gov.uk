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

const ORDER_ID = "ORD-123-456";
const ORDER_ID_ARIA_LABEL = "ORD hyphen 123 hyphen 456";
const CERTIFICATE_ID = "CHS00000000000000000";
const mockOrderResponse: Order = {
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

const mockBasketResponse: Basket = {
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
        companyName: "company name",
        companyNumber: "00000000",
        customerReference: "reference",
        description: "description",
        descriptionIdentifier: "description identifier",
        descriptionValues: { key: "value" },
        etag: "etag",
        id: CERTIFICATE_ID,
        itemCosts: [{
            calculatedCost: "calculated cost",
            discountApplied: "discount applies",
            itemCost: "item cost",
            productType: "product type"
        }],
        itemOptions: { key: {} },
        itemUri: "/orderable/certificates/" + CERTIFICATE_ID,
        kind: "item#certificate",
        links: { self: "/orderable/certificates/" + CERTIFICATE_ID },
        postageCost: "postage cost",
        postalDelivery: true,
        quantity: 1,
        totalItemCost: "total item cost"
    }],
    kind: "kind",
    links: {
        self: "self"
    },
    totalBasketCost: "5"
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

    it("renders get order page on successful get order call", (done) => {
        getOrderStub = sandbox.stub(apiClient, "getOrder").returns(Promise.resolve(mockOrderResponse));

        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                const $ = cheerio.load(resp.text);

                chai.expect(resp.status).to.equal(200);
                chai.expect($("#orderReference").text()).to.equal(mockOrderResponse.reference);
                chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                chai.expect($("#companyNameValue").text()).to.equal(mockOrderResponse.items[0].companyName);
                chai.expect($("#companyNumberValue").text()).to.equal(mockOrderResponse.items[0].companyNumber);
                chai.expect($("#certificateTypeValue").text()).to.equal("Incorporation with all company name changes");
                chai.expect($("#includedOnCertificateValue").html()).to.equal("Statement of good standing<br>Registered office address");
                chai.expect($("#deliveryMethodValue").text()).to.equal("Standard delivery (dispatched within 4 working days)");
                chai.expect($("#deliveryAddressValue").html()).to.equal("forename surname<br>address line 1<br>address line 2<br>locality<br>region<br>postal code<br>country");
                chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                chai.expect($("#paymentReferenceValue").text()).to.equal(mockOrderResponse.paymentReference);
                chai.expect($("#paymentTimeValue").text()).to.equal("16 Dec 2019 - 09:16:17");
                chai.expect(getOrderStub).to.have.been.called;
                done();
            });
    });

    it("renders an error page if get order fails", (done) => {
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

    it("redirects to check details in certs web if status is cancelled and item type is certificate", (done) => {
        getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(mockBasketResponse));
        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=cancelled`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.redirects[0]).to.include(`/orderable/certificates/${CERTIFICATE_ID}/check-details`);
                done();
            });
    });

    it("redirects to check details in certs web if status is failed and item type is certificate", (done) => {
        getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(mockBasketResponse));
        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=failed`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.redirects[0]).to.include(`/orderable/certificates/${CERTIFICATE_ID}/check-details`);
                done();
            });
    });
});
