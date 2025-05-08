import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import nock from "nock";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import createError from "http-errors";
import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession, signedInSessionWithCsrf, CSRF_TOKEN } from "../__mocks__/redis.mocks";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";
import { getAppWithMockedCsrf } from '../__mocks__/csrf.mocks';
import { BASKET_ITEM_LIMIT } from "../../config/config";
import { ADD_ANOTHER_DOCUMENT_PATH, BASKET as BASKET_URL } from "../../model/page.urls";
import cheerio from "cheerio";
import { verifyUserNavBarRenderedWithoutBasketLink } from "../utils/page.header.utils.test";
import * as redisUtils from "../../utils/redisMethods"; // Adjust the path as needed

const sandbox = sinon.createSandbox();
let testApp:any ;
let checkoutBasketStub;
let createPaymentStub;

const MOCK_PAYMENT_URL = "http://example.co";

describe("basket.controller.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        sinon.stub(redisUtils, 'setKey').resolves();
        nock(MOCK_PAYMENT_URL).get("/?summary=false").reply(200, {});

        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
        sinon.restore();
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

    it("renders basket with CSRF hidden input of a empty string value if missing from session", (done) => {
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
                chai.expect(resp.text).to.contain("<input type=\"hidden\" name=\"_csrf\" value=\"\">");
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it("renders basket with CSRF hidden input of correct value if missing from session", (done) => {
        //override so the session contains a 'csrf_token' value
        sandbox.restore();
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSessionWithCsrf));
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
                chai.expect(resp.text).to.contain(`<input type="hidden" name="_csrf" value="${CSRF_TOKEN}">`);
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it("should store paymentID in Redis after successful payment creation", (done) => {
        sinon.restore();
        const paymentId = "qf24hf53j32j";
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            headers: {
                "X-Payment-Required": MOCK_PAYMENT_URL + "/" + paymentId
            }
        };
        checkoutResponse.resource = { reference: "1234" } as Checkout;
        const checkoutPayment: ApiResponse<Payment> = {
            httpStatusCode: 200
        };
        checkoutPayment.resource = { links: { journey: MOCK_PAYMENT_URL , self: MOCK_PAYMENT_URL + "/" + paymentId} } as Payment;
        const setKeyStub = sandbox.stub(redisUtils, "setKey").resolves();
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
                chai.expect(setKeyStub).to.have.been.called;
                sinon.assert.calledWith(setKeyStub, "1234", "qf24hf53j32j", 3600);
                done();
                sandbox.restore();
                sinon.restore();
            });
    });
    

    it ("renders basket details  and warning message if user is enrolled for multi-item baskets and items at the limit", (done) => {
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: true,
            items: [
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem,
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem,
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem,
                mockCertificateItem
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
            .get(`${BASKET_URL}`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT})`);
                chai.expect(resp.text).to.contain("Your basket is full");
                chai.expect(resp.text).to.contain(`You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
                chai.expect(resp.text).to.contain("To add more, you'll need to remove some items first.");
                chai.expect(getBasketStub).to.have.been.called;
                done();
            });
    });

    it ("renders basket details, error message  when add another document button is clicked if user is enrolled for multi-item baskets and items over the limit", (done) => {
        const getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve({
            enrolled: true,
            items: [
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem,
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem,
                mockCertificateItem,
                mockCertifiedCopyItem,
                mockMissingImageDeliveryItem,
                mockCertificateItem,
                mockCertificateItem

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

        const url : string = `${BASKET_URL}${ADD_ANOTHER_DOCUMENT_PATH}`;
        chai.request(testApp)
            .get(url)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT + 1})`);
                chai.expect(resp.text).to.contain("Add another document");
                chai.expect(resp.text).to.contain("There is a problem");
                chai.expect(resp.text).to.contain(`Your basket is full. To add more to your order, you&#39;ll need to remove some items first.`);
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

    it("renders error page with user nav bar if orders API is down", async () => {
        // given
        sandbox.stub(apiClient, "getBasket").throws(createError(404, "Not Found"));

        // when
        const resp = await chai.request(testApp)
            .get("/basket")
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        // then
        chai.expect(resp.status).to.equal(404);
        const $ = cheerio.load(resp.text);
        chai.expect($(".govuk-heading-xl").text()).to.contain("Sorry, there is a problem with the service");
        verifyServiceLinkRenderedCorrectly($);
        verifyUserNavBarRenderedWithoutBasketLink(resp.text);
    });
});

const verifyServiceLinkRenderedCorrectly = ($: cheerio.Root) => {
    chai.expect($(".govuk-header__content").text()).to.contain("Find and update company information");
    chai.expect($(".govuk-header__content").children().attr("href")).to.equal("http://chsurl.co");
};
function done(err: any) {
    throw new Error("Function not implemented.");
}

