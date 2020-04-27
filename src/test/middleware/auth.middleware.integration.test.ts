import * as chai from "chai";
import * as sinon from "sinon";
import * as ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";
import { ORDERS, ORDER_COMPLETE, BASKET } from "../../model/page.urls"

const tests = [ORDERS, ORDER_COMPLETE, BASKET];

let sandbox = sinon.createSandbox();
let testApp = null;

describe("auth.middleware", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedOutSession));

        testApp = require("../../app").default;
        done();
    });

    afterEach(function () {
        sandbox.restore();
    });

    tests.forEach((test) => {
        it("should redirect " + test + " to signin if user is not logged in", (done) => {
            chai.request(testApp)
                .get(test)
                .set('Cookie', [`__SID=${SIGNED_OUT_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    console.log(resp.body)
                    chai.expect(resp.status).to.equal(302);
                    chai.expect(resp.header.location).to.contain("/signin");
                    done();
                });
        });
    });



});  
