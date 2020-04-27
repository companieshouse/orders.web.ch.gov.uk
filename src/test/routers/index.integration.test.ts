import * as chai from "chai";
import * as sinon from "sinon";
import * as ioredis from "ioredis";
import {SIGNED_IN_COOKIE, signedInSession} from "../mocks/redis.mocks";

let sandbox = sinon.createSandbox();
let testApp = null;

describe("index", () => {
  beforeEach(done => {
    sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
    sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

    testApp = require("../../app").default;
    done();
  });

  afterEach(function () {
    sandbox.restore();
  });


  it("renders a blank page for orders", (done) => {
    chai.request(testApp)
      .get("/orders")
      .set('Cookie', [`__SID=${SIGNED_IN_COOKIE}`])
      .end((err, resp) => {
        if (err) return done(err);
        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.equal("");
        done();
      });
  });

  it("renders the order complete page", (done) => {
    chai.request(testApp)
      .get("/orders/order-id/order-complete")
      .set('Cookie', [`__SID=${SIGNED_IN_COOKIE}`])
      .end((err, resp) => {
        if (err) return done(err);
        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Certificate ordered");
        done();
      });
  });


});  
