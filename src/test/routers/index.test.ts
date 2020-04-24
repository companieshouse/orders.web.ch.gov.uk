//import app from "../../app";
const chai = require('chai');
const chaiHttp = require('chai-http');
import * as sinon from "sinon";
import * as ioredis from "ioredis";
import * as SessionStoreClass from "ch-node-session-handler/lib/session/store/SessionStore";
import { wrapEither } from "ch-node-session-handler/lib/utils/EitherAsyncUtils";
import { Either } from "purify-ts";
import { Encoding } from "ch-node-session-handler/lib/encoding/Encoding";

const SIGNED_IN_ID = "4ZhJ6pAmB5NAJbjy/6fU1DWMqqrk";
const SIGNED_IN_SIGNATURE = "Ak4CCqkfPTY7VN6f9Lo5jHCUYpM";
const SIGNED_IN_COOKIE = SIGNED_IN_ID + SIGNED_IN_SIGNATURE;

let sandbox = sinon.createSandbox();
let testApp = null;

chai.use(chaiHttp);

const signedInSession = {
  ".client.signature": SIGNED_IN_SIGNATURE,
  ".id": SIGNED_IN_ID,
  "expires": Date.now() + 3600 * 1000,
  "signin_info": {
    access_token: {
      access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
      expires_in: 3600,
      refresh_token: "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
      token_type: "Bearer",
    },
    signed_in: 1,
  },
  "extra_data": {
    "certificates.orders.web.ch.gov.uk": {
      certificate: {
        id: "CHS00000000000000001",
        companyNumber: "00000000"
      }
    }
  }
};

describe("index", () => {
  beforeEach(done => {
    sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
    sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(Encoding.encode(signedInSession)));

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
