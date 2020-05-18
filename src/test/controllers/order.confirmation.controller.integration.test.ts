import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { Order } from "ch-sdk-node/dist/services/order/order";
import cheerio from "cheerio";

import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let getOrderStub;

const ORDER_ID = "123abc";
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
        id: "CHS00000000000000000",
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
            self: "/orderable/certificates/CHS00000000000000000"
        },
        postalDelivery: true,
        quantity: 1,
        itemUri: "/orderable/certificates/CHS00000000000000000",
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
                chai.expect($("#companyNameValue").text()).to.equal(mockOrderResponse.items[0].companyName);
                chai.expect($("#companyNumberValue").text()).to.equal(mockOrderResponse.items[0].companyNumber);
                chai.expect($("#certificateTypeValue").text()).to.equal("Incorporation with all company name changes");
                chai.expect($("#includedOnCertificateValue").html()).to.equal("Statement of good standing<br>Registered office address");
                chai.expect($("#deliveryMethodValue").text()).to.equal("Standard delivery (dispatched within 4 working days)");
                chai.expect($("#deliveryAddressValue").html()).to.equal("forename surname<br>address line 1<br>address line 2<br>locality<br>postal code<br>region<br>country");
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
});
