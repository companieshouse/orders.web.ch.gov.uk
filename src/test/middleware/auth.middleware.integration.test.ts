import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../__mocks__/csrf.mocks';
import { ORDERS, BASKET } from "../../model/page.urls";
import { ORDER_CONFIRMATION } from "../utils/constants";

const tests = [ORDERS, ORDER_CONFIRMATION, BASKET];

const sandbox = sinon.createSandbox();
let testApp = null;

describe("auth.middleware.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedOutSession));

        testApp = getAppWithMockedCsrf(sandbox);
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
