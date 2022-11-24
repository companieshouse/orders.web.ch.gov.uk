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
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem} from "../__mocks__/order.mocks";

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

    it("redirects to payment page with summary as false if user is disenrolled from multi-item baskets", (done) => {
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
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: false
        }));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp).to.redirectTo(MOCK_PAYMENT_URL + "/?summary=false");
                chai.expect(checkoutBasketStub).to.have.been.called;
                chai.expect(createPaymentStub).to.have.been.called;
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it("renders basket details if user is enrolled for multi-item baskets", (done) => {
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: true,
            items: [
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem
            ],
            deliveryDetails : {
                addressLine1 : "Silverstone",
                addressLine2 : "Towcester",
                country : "England",
                forename : "Lewis",
                surname : "Hamilton",
                locality : "Northamponshire",
                postal_code : "NN12 8TN",
                region : "South"
            },
        } as any));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.text).to.contain("Missing image requests");
                chai.expect(resp.text).to.contain("Certified documents");
                chai.expect(resp.text).to.contain("Certified certificates");
                chai.expect(resp.text).to.contain("Continue to payment");
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it("renders empty basket if user is enrolled for multi-item baskets and their basket is empty", (done) => {
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: true,
            items: []
        } as any));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.text).to.contain("Your basket is empty, find a company to start ordering.");
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it("renders basket details with add delivery details button for enrolled user with deliverables and no delivery details", (done) => {
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: true,
            items: [
                mockCertificateItem
            ]
        } as any));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.text).to.contain("Add delivery details");
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it("renders basket details with add continue to payment button for enrolled user without deliverables and no delivery details", (done) => {
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: true,
            items: [
                mockMissingImageDeliveryItem
            ]
        } as any));
        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.text).to.contain("Continue to payment");
                chai.expect(getBasketStub).to.have.been.called;
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
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: false
        }));

        chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.redirects[0]).to.include("/orders/1234/confirmation");
                chai.expect(getBasketStub).to.have.been.called;
                chai.expect(checkoutBasketStub).to.have.been.called;
                chai.expect(createPaymentStub).to.not.have.been.called;
                done();
            });
    });

    it("renders an error page if checkout basket fails", (done) => {
        sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: false
        }));
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
        sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: false
        }));
        checkoutBasketStub = sandbox.stub(apiClient, "checkoutBasket").throws(createError(409, "Delivery details missing for postal delivery"));
        const resp = await chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(409);
        chai.expect(resp.text).to.contains("If you pasted the web address to order a document, you'll need to start the order again.");
    });

    it("handles remove postback successfully", (done) => {
        sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            id: "1234",
            createdAt: "created at",
            updatedAt: "updated at",
            data: {
                items: [
                    {
                        itemUri: "/orderable/certificate/12345678"
                    }
                ],
                enrolled: true
            }
        }));

        const removeBasketItem = sandbox.stub(apiClient, "removeBasketItem").returns(Promise.resolve({
            httpStatusCode: 200
        }));

        chai.request(testApp)
            .post("/basket/remove/12345678")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(removeBasketItem).to.have.been.called;
                chai.expect(resp.redirects[0]).to.include("basket");
                done();
            });
    });

    it("handles remove postback successfully itemId no match", (done) => {
        sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            id: "1234",
            createdAt: "created at",
            updatedAt: "updated at",
            data: {
                items: [
                    {
                        itemUri: "/orderable/certificate/12345678"
                    }
                ],
                enrolled: true
            }
        }));

        const removeBasketItem = sandbox.stub(apiClient, "removeBasketItem");

        chai.request(testApp)
            .post("/basket/remove/87654321")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(removeBasketItem).to.not.have.been.called;
                chai.expect(resp.redirects[0]).to.include("basket");
                done();
            });
    });
});
