import * as chai from "chai";
import * as sinon from "sinon";
import * as ioredis from "ioredis";

import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";

const sandbox = sinon.createSandbox();
let testApp = null;
let checkoutBasketStub;

describe("basket.controller", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../app").default;
        done();
    });

    afterEach(function () {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders a blank page for basket and checkout basket", (done) => {
        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").returns(Promise.resolve({} as Checkout));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.status).to.equal(200);
                chai.expect(resp.text).to.equal("");
                chai.expect(checkoutBasketStub).to.have.been.called;
                done();
            });
    });

    it("renders an error page if checkout basket fails", (done) => {
        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").returns(Promise.reject(new Error("ERROR")));
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
