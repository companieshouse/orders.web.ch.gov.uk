import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";
import { ORDERS, ORDER_COMPLETE, BASKET } from "../../model/page.urls";

const tests = [/* TODO GCI-2127 Restore this test ORDERS, */
    "/orders/ORD-453216-553922/confirmation?ref=orderable_item_ORD-453216-553922&state=096e9be6-e57e-4923-8785-6b68b95665ee&status=paid",
    ORDER_COMPLETE, BASKET];

const sandbox = sinon.createSandbox();
let testApp = null;

describe("auth.middleware.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedOutSession));

        testApp = require("../../app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    tests.forEach((test) => {
        it("should redirect " + test + " to signin if user is not logged in", (done) => {
            chai.request(testApp)
                .get(test)
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    chai.expect(resp.redirects[0]).to.include("/signin");
                    done();
                });
        });
    });
});
