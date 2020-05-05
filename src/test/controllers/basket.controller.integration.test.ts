import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import nock from "nock";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";
import { ApiResponse } from "ch-sdk-node/dist/services/resource";
import { Payment } from "ch-sdk-node/dist/services/payment";

import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import { CHS_URL } from "../../config/config";

const sandbox = sinon.createSandbox();
let testApp = null;
let checkoutBasketStub;
let createPaymentStub;

const MOCK_PAYMENT_URL = "http://example.co/";

describe("basket.controller", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        nock(MOCK_PAYMENT_URL).get("/").reply(200, {});

        testApp = require("../../app").default;
        done();
    });

    afterEach(function () {
        sandbox.reset();
        sandbox.restore();
    });

    it("redirects to payment page", (done) => {
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
                chai.expect(resp).to.redirectTo(MOCK_PAYMENT_URL);
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
});
