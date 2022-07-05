import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import nock from "nock";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import createError from "http-errors";

import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let checkoutBasketStub;
let createPaymentStub;

const MOCK_PAYMENT_URL = "http://example.co";

describe("basket.controller.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        nock(MOCK_PAYMENT_URL).get("/?summary=false").reply(200, {});

        testApp = require("../../app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("redirects to payment page with summary as false", (done) => {
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            headers: {
                "X-Payment-Required": MOCK_PAYMENT_URL
            }
        };
        checkoutResponse.resource = { reference: "1234" } as Checkout;

        const checkoutPayment: ApiResponse<Payment> = {
            httpStatusCode: 200
        };
        checkoutPayment.resource = { links: { journey: MOCK_PAYMENT_URL } } as Payment;

        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").returns(Promise.resolve(checkoutResponse));
        createPaymentStub = sandbox.stub(apiClient, "createPayment").returns(Promise.resolve(checkoutPayment));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp).to.redirectTo(MOCK_PAYMENT_URL + "/?summary=false");
                chai.expect(checkoutBasketStub).to.have.been.called;
                chai.expect(createPaymentStub).to.have.been.called;
                done();
            });
    });

    it("redirects to the order confirmation page if X-Payment-Required is not present", (done) => {
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            headers: {}
        };
        checkoutResponse.resource = { reference: "1234" } as Checkout;

        const checkoutPayment: ApiResponse<Payment> = {
            httpStatusCode: 200
        };
        checkoutPayment.resource = { links: { journey: MOCK_PAYMENT_URL } } as Payment;

        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").returns(Promise.resolve(checkoutResponse));
        createPaymentStub = sandbox.stub(apiClient, "createPayment").returns(Promise.resolve(checkoutPayment));

        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.redirects[0]).to.include("/orders/1234/confirmation");
                chai.expect(checkoutBasketStub).to.have.been.called;
                chai.expect(createPaymentStub).to.not.have.been.called;
                done();
            });
    });

    it("renders an error page if checkout basket fails", (done) => {
        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").throws(new Error("ERROR"));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.status).to.equal(500);
                done();
            });
    });

    it("renders an error page if delivery details are missing", async () => {
        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").throws(createError(409, "Delivery details missing for postal delivery"));
        const resp = await chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(409);
        chai.expect(resp.text).to.contains("If you pasted the web address to order a document, you'll need to start the order again.");
    });
});
