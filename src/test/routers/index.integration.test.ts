import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("index.integration", () => {
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

    it("renders a blank page for orders", (done) => {
        chai.request(testApp)
            .get("/orders")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.status).to.equal(200);
                chai.expect(resp.text).to.equal("");
                done();
            });
    });
});
