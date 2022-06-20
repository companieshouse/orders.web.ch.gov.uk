import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";
import { ORDERS, ORDER_COMPLETE, BASKET } from "../../model/page.urls";
import { mockCertificateCheckoutResponse, mockCertificateItem } from "../__mocks__/order.mocks";
import { CompanyType } from "../../model/CompanyType";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import * as apiClient from "../../client/api.client";

const tests = [/* TODO GCI-2127 Restore this test ORDERS, */
    "/orders/ORD-453216-553922/confirmation?ref=orderable_item_ORD-453216-553922&state=096e9be6-e57e-4923-8785-6b68b95665ee&status=paid",
    ORDER_COMPLETE, BASKET];

const sandbox = sinon.createSandbox();
let testApp = null;

describe("auth.middleware.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedOutSession));

        // TODO GCI-2127 Setting up API response only necessary if middleware calls out to Checkout API.
        const certificateCheckoutResponse = {
            ...mockCertificateCheckoutResponse,
            items: [{
                ...mockCertificateItem,
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    deliveryMethod: "postal",
                    deliveryTimescale: "standard",
                    forename: "forename",
                    includeGoodStandingInformation: true,
                    principalPlaceOfBusinessDetails: {
                        includeAddressRecordsType: "current-and-previous"
                    },
                    generalPartnerDetails: {
                        includeBasicInformation: true
                    },
                    limitedPartnerDetails: {
                        includeBasicInformation: true
                    },
                    includeGeneralNatureOfBusinessInformation: true,
                    surname: "surname",
                    companyType: CompanyType.LIMITED_PARTNERSHIP
                }
            }]
        } as Checkout;
        sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(certificateCheckoutResponse));

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
