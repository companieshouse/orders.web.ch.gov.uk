import chai, { expect } from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { Basket, BasketLinks } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import cheerio from "cheerio";

import * as apiClient from "../../client/api.client";
import { SIGNED_IN_COOKIE, signedInSession } from "../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../__mocks__/csrf.mocks';
import {
    mockCertificateCheckoutResponse,
    mockCertificateItem,
    mockCertifiedCopyCheckoutResponse,
    mockDissolvedCertificateCheckoutResponse,
    mockMissingImageDeliveryCheckoutResponse,
    mockMissingImageDeliveryItem,
    mockPaymentResponse,
    ORDER_ID
} from "../__mocks__/order.mocks";
import { MapUtil } from "../../service/MapUtil";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { CompanyType } from "../../model/CompanyType";
import { DobType } from "../../model/DobType";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment/types";
import  *  as getWhitelistedReturnToURL from "../../utils/request.util";
import * as redisUtils from "../../utils/redis.methods";

const sandbox = sinon.createSandbox();
let testApp = null;
let getOrderStub;
let getBasketLinksStub;
let getBasketStub;
let getPaymentStub;
let getKeyStub;

const ORDER_ID_ARIA_LABEL = "ORD hyphen 123456 hyphen 123456";

const ITEM_KINDS = [{
    kind: "item#certificate",
    name: "certificate",
    url: "/orderable/certificates/CRT-123456-123456"
},
{
    kind: "item#certified-copy",
    name: "certified-copy",
    url: "/orderable/certified-copies/CCD-123456-123456"
},
{
    kind: "item#missing-image-delivery",
    name: "missing-image-delivery",
    url: "/orderable/missing-image-delivery/MID-123456-123456"
}];

describe("order.confirmation.controller.integration", () => {
    beforeEach(done => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
  
        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
        sinon.restore();
    });

    describe("Certificate order confirmation page integration tests", () => {
        it("Renders order summary page if the user is enrolled and missing image delivery requested", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');
  
            const certificateCheckoutResponse = {
                ...mockMissingImageDeliveryCheckoutResponse
            } as Checkout;

            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: certificateCheckoutResponse
            }
            const certificatePaymentResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: mockPaymentResponse,
            }
            getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                certificatePaymentResponse,
            ));


            const whitelistedUrlStub = sandbox.stub(getWhitelistedReturnToURL, "getWhitelistedReturnToURL");

            // stops the test from removing the status and state query params
            whitelistedUrlStub
            .withArgs(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .returns(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`);


            getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: true
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));

            chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    const $ = cheerio.load(resp.text);

                    verifyServiceLinkRenderedCorrectly($);

                    chai.expect(resp.status).to.equal(200);
                    chai.expect($("#orderReference").text()).to.equal(mockMissingImageDeliveryCheckoutResponse.reference);
                    chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                    chai.expect($("#hasMissingImageDeliveryItems").length).equals(1);
                    chai.expect($("#hasExpressDeliveryItems").length).equals(0);
                    chai.expect($("#hasStandardDeliveryItems").length).equals(0);
                    chai.expect($("#deliveryAddressValue").length).equals(0);
                    chai.expect($("#paymentAmountValue").text()).to.equal("£3");
                    chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                    chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(getOrderStub).to.have.been.called;
                    chai.expect(getBasketLinksStub).to.have.been.called;
                    chai.expect(resp.text).to.contain("Order received");
                    sandbox.restore();
                    done();
                });
        });

        it("Renders order summary page if the user is enrolled and standard delivery requested", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');

            const certificateCheckoutResponse = {
                ...mockCertificateCheckoutResponse
            } as Checkout;

            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: certificateCheckoutResponse
            }
            const certificatePaymentResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: mockPaymentResponse,
            }
            getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                certificatePaymentResponse,
            ));

            getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: true
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));
            
            const whitelistedUrlStub = sandbox.stub(getWhitelistedReturnToURL, "getWhitelistedReturnToURL");

            // stops the test from removing the status and state query params
            whitelistedUrlStub
            .withArgs(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .returns(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`);

            chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    const $ = cheerio.load(resp.text);
                    verifyServiceLinkRenderedCorrectly($);

                    chai.expect(resp.status).to.equal(200);
                    chai.expect($("#orderReference").text()).to.equal(mockCertificateCheckoutResponse.reference);
                    chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                    chai.expect($("#hasMissingImageDeliveryItems").length).equals(0);
                    chai.expect($("#hasExpressDeliveryItems").length).equals(0);
                    chai.expect($("#hasStandardDeliveryItems").length).equals(1);
                    chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                    chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                    chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                    chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(getOrderStub).to.have.been.called;
                    chai.expect(getBasketLinksStub).to.have.been.called;
                    chai.expect(resp.text).to.contain("Order received");
                    done();
                });
        });
        it("Renders order summary page if the user is enrolled and express delivery requested", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');

            const certificateCheckoutResponse = {
                ...mockCertificateCheckoutResponse,
                items: [
                    {
                        ...mockCertificateCheckoutResponse.items[0],
                        itemOptions: {
                            ...mockCertificateCheckoutResponse.items[0].itemOptions,
                            deliveryTimescale: "same-day"
                        }
                    }
                ]
            } as Checkout;

            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: certificateCheckoutResponse
            }

            const certificatePaymentResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: mockPaymentResponse,
            }
            getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                certificatePaymentResponse,
            ));

            getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: true
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));

            const whitelistedUrlStub = sandbox.stub(getWhitelistedReturnToURL, "getWhitelistedReturnToURL");

            // stops the test from removing the status and state query params
            whitelistedUrlStub
            .withArgs(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .returns(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`);


            chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    const $ = cheerio.load(resp.text);
                    verifyServiceLinkRenderedCorrectly($);

                    chai.expect(resp.status).to.equal(200);
                    chai.expect($("#orderReference").text()).to.equal(mockCertificateCheckoutResponse.reference);
                    chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                    chai.expect($("#hasMissingImageDeliveryItems").length).equals(0);
                    chai.expect($("#hasExpressDeliveryItems").length).equals(1);
                    chai.expect($("#hasStandardDeliveryItems").length).equals(0);
                    chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                    chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                    chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                    chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(getOrderStub).to.have.been.called;
                    chai.expect(getBasketLinksStub).to.have.been.called;
                    chai.expect(resp.text).to.contain("Order received");
                    done();
                });
        });
        it("Renders order summary page if the user is enrolled, items with express and standard delivery requested and missing image delivery requested", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');

            const certificateCheckoutResponse = {
                ...mockCertificateCheckoutResponse,
                items: [
                    {
                        ...mockCertificateCheckoutResponse.items[0],
                        itemOptions: {
                            ...mockCertificateCheckoutResponse.items[0].itemOptions,
                            deliveryTimescale: "same-day"
                        }
                    },
                    {
                        ...mockCertificateCheckoutResponse.items[0],
                    },
                    {
                        ...mockMissingImageDeliveryItem
                    }
                ]
            } as Checkout;

            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: certificateCheckoutResponse
            }
            const certificatePaymentResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: mockPaymentResponse,
            }
            getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                certificatePaymentResponse,
            ));

            getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: true
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));

            const whitelistedUrlStub = sandbox.stub(getWhitelistedReturnToURL, "getWhitelistedReturnToURL");

            // stops the test from removing the status and state query params
            whitelistedUrlStub
            .withArgs(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .returns(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`);

            chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    const $ = cheerio.load(resp.text);
                    verifyServiceLinkRenderedCorrectly($);

                    chai.expect(resp.status).to.equal(200);
                    chai.expect($("#orderReference").text()).to.equal(mockCertificateCheckoutResponse.reference);
                    chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                    chai.expect($("#hasMissingImageDeliveryItems").length).equals(1);
                    chai.expect($("#hasExpressDeliveryItems").length).equals(1);
                    chai.expect($("#hasStandardDeliveryItems").length).equals(1);
                    chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                    chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                    chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                    chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(getOrderStub).to.have.been.called;
                    chai.expect(getBasketLinksStub).to.have.been.called;
                    chai.expect(resp.text).to.contain("Order received");
                    done();
                });
        });
        it("Correctly renders order confirmation page on for a limited company certificate order", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');
      
            const certificateCheckoutResponse = {
                ...mockCertificateCheckoutResponse
            } as Checkout;

            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: certificateCheckoutResponse
            }
            getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: false
                }
            } as BasketLinks));

            const certificatePaymentResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: mockPaymentResponse,
            }
            getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                certificatePaymentResponse,
            ));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));

            chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certificate`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    const $ = cheerio.load(resp.text);
                    verifyServiceLinkRenderedCorrectly($);

                    chai.expect(resp.status).to.equal(200);
                    chai.expect($("#orderReference").text()).to.equal(mockCertificateCheckoutResponse.reference);
                    chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                    chai.expect($("#companyNameValue").text()).to.equal(mockCertificateCheckoutResponse.items[0].companyName);
                    chai.expect($("#companyNumberValue").text()).to.equal(mockCertificateCheckoutResponse.items[0].companyNumber);
                    chai.expect($("#certificateTypeValue").text()).to.equal("Incorporation with all company name changes");
                    chai.expect($("#statementOfGoodStandingValue").html()).to.equal("Yes");
                    chai.expect($("#deliveryMethodValue").text()).to.equal("Standard (aim to send out within 10 working days)");
                    chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                    chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                    chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                    chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                    chai.expect($("#registeredOfficeAddress").text().trim()).to.equal("Current address and the one previous");
                    chai.expect($("#currentCompanyDirectors").html()).to.equal("Yes");
                    chai.expect($("#currentCompanySecretaries").html()).to.equal("Yes");
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(getOrderStub).to.have.been.called;
                    chai.expect(getBasketLinksStub).to.have.been.called;
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(resp.text).to.not.contain("Your document details");
                    done();
                });
        });

        it("Correctly renders order confirmation page on for a LLP company certificate order", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');

            const certificateCheckoutResponse = {
                ...mockCertificateCheckoutResponse,
                items: [{
                    ...mockCertificateItem,
                    itemOptions: {
                        certificateType: "incorporation-with-all-name-changes",
                        deliveryMethod: "postal",
                        deliveryTimescale: "standard",
                        includeEmailCopy: false,
                        forename: "forename",
                        includeGoodStandingInformation: true,
                        registeredOfficeAddressDetails: {
                            includeAddressRecordsType: "current-and-previous"
                        },
                        designatedMemberDetails: {
                            includeAddress: true,
                            includeAppointmentDate: true,
                            includeBasicInformation: true,
                            includeCountryOfResidence: true,
                            includeDobType: DobType.PARTIAL
                        },
                        memberDetails: {
                            includeAddress: true,
                            includeAppointmentDate: true,
                            includeBasicInformation: true,
                            includeCountryOfResidence: true,
                            includeDobType: DobType.PARTIAL
                        },
                        surname: "surname",
                        companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP
                    }
                }]
            } as Checkout;

            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                resource: certificateCheckoutResponse
            }
            const certificatePaymentResponse: ApiResponse<Payment> = {
                httpStatusCode: 200,
                resource: mockPaymentResponse,
            }
            getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                certificatePaymentResponse,
            ));

            getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: false
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));

            chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certificate`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, resp) => {
                    if (err) return done(err);
                    const $ = cheerio.load(resp.text);
                    verifyServiceLinkRenderedCorrectly($);

                    chai.expect(resp.status).to.equal(200);
                    chai.expect($("#orderReference").text()).to.equal(mockCertificateCheckoutResponse.reference);
                    chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                    chai.expect($("#companyNameValue").text()).to.equal(mockCertificateCheckoutResponse.items[0].companyName);
                    chai.expect($("#companyNumberValue").text()).to.equal(mockCertificateCheckoutResponse.items[0].companyNumber);
                    chai.expect($("#certificateTypeValue").text()).to.equal("Incorporation with all company name changes");
                    chai.expect($("#statementOfGoodStandingValue").html()).to.equal("Yes");
                    chai.expect($("#deliveryMethodValue").text()).to.equal("Standard (aim to send out within 10 working days)");
                    chai.expect($("#emailCopyRequiredValue").text()).to.equal("Email only available for express dispatch");
                    chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                    chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                    chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                    chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                    chai.expect($("#registeredOfficeAddress").text().trim()).to.equal("Current address and the one previous");
                    chai.expect($("#currentDesignatedMembersNames").html()).to.equal("Including designated members':<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>");
                    chai.expect($("#currentMembersNames").html()).to.equal("Including members':<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>");
                    chai.expect(getPaymentStub).to.have.been.called;
                    chai.expect(getOrderStub).to.have.been.called;
                    chai.expect(getBasketLinksStub).to.have.been.called;
                    chai.expect(resp.text).to.not.contain("Your document details");
                    done();
                });
        });

    });

    it("Correctly renders order confirmation page on for a LP company certificate order", (done) => {
        getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');
        
        const certificateCheckoutResponse = {
            ...mockCertificateCheckoutResponse,
            items: [{
                ...mockCertificateItem,
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    deliveryMethod: "postal",
                    deliveryTimescale: "standard",
                    includeEmailCopy: false,
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

        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: certificateCheckoutResponse
        }

        const certificatePaymentResponse: ApiResponse<Payment> = {
            httpStatusCode: 200,
            resource: mockPaymentResponse,
        }
        getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
            certificatePaymentResponse,
        ));

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));
        getBasketStub = sandbox.stub(apiClient, "getBasket")
        .returns(Promise.resolve({ enrolled: true }));

        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certificate`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                const $ = cheerio.load(resp.text);
                verifyServiceLinkRenderedCorrectly($);

                chai.expect(resp.status).to.equal(200);
                chai.expect($("#orderReference").text()).to.equal(mockCertificateCheckoutResponse.reference);
                chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                chai.expect($("#companyNameValue").text()).to.equal(mockCertificateCheckoutResponse.items[0].companyName);
                chai.expect($("#companyNumberValue").text()).to.equal(mockCertificateCheckoutResponse.items[0].companyNumber);
                chai.expect($("#certificateTypeValue").text()).to.equal("Incorporation with all company name changes");
                chai.expect($("#statementOfGoodStandingValue").html()).to.equal("Yes");
                chai.expect($("#deliveryMethodValue").text()).to.equal("Standard (aim to send out within 10 working days)");
                chai.expect($("#emailCopyRequiredValue").text()).to.equal("Email only available for express dispatch");
                chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                chai.expect($("#principalPlaceOfBusiness").text().trim()).to.equal("Current address and the one previous");
                chai.expect($("#generalPartners").html()).to.equal("Yes");
                chai.expect($("#limitedPartners").html()).to.equal("Yes");
                chai.expect($("#generalNatureOfBusiness").html()).to.equal("Yes");
                chai.expect(getPaymentStub).to.have.been.called;
                chai.expect(getOrderStub).to.have.been.called;
                chai.expect(getBasketLinksStub).to.have.been.called;
                chai.expect(resp.text).to.not.contain("Your document details");
                done();
            });
    });

    it("renders get order page on successful get checkout call for a dissolved certificate order", (done) => {
        getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');
        
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockDissolvedCertificateCheckoutResponse
        }

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));
        getBasketStub = sandbox.stub(apiClient, "getBasket")
        .returns(Promise.resolve({ enrolled: true }));

        const certificatePaymentResponse: ApiResponse<Payment> = {
            httpStatusCode: 200,
            resource: mockPaymentResponse,
        }
        getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
            certificatePaymentResponse,
        ));

        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certificate`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                const $ = cheerio.load(resp.text);
                verifyServiceLinkRenderedCorrectly($);

                chai.expect(resp.status).to.equal(200);
                chai.expect($("#orderReference").text()).to.equal(mockDissolvedCertificateCheckoutResponse.reference);
                chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
                chai.expect($("#companyNameValue").text()).to.equal(mockDissolvedCertificateCheckoutResponse.items[0].companyName);
                chai.expect($("#companyNumberValue").text()).to.equal(mockDissolvedCertificateCheckoutResponse.items[0].companyNumber);
                chai.expect($("#certificateTypeValue").text()).to.equal("Dissolution with all company name changes");
                chai.expect($("#emailCopyRequiredValue").text()).to.equal("Email only available for express dispatch");
                chai.expect($("#deliveryMethodValue").text()).to.equal("Standard (aim to send out within 10 working days)");
                chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
                chai.expect($("#paymentAmountValue").text()).to.equal("£15");
                chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
                chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
                chai.expect(getPaymentStub).to.have.been.called;
                chai.expect(getOrderStub).to.have.been.called;
                chai.expect(getBasketLinksStub).to.have.been.called;
                chai.expect(resp.text).to.not.contain("Your document details");
                done();
            });
    });

    it("renders get order page on successful get checkout call for a certified copy order", async () => {
        getKeyStub = sinon.stub(redisUtils, 'getKey');
        getKeyStub.resolves('q4nn5UxZiZxVG2e');
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockCertifiedCopyCheckoutResponse
        };

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));
        getBasketStub = sandbox.stub(apiClient, "getBasket")
        .returns(Promise.resolve({ enrolled: true }));

        const certificatePaymentResponse: ApiResponse<Payment> = {
            httpStatusCode: 200,
            resource: mockPaymentResponse,
        }
        getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
            certificatePaymentResponse,
        ));

        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=certified-copy`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        const $ = cheerio.load(resp.text);

        chai.expect(resp.status).to.equal(200);
        chai.expect($("#orderReference").text()).to.equal(mockCertifiedCopyCheckoutResponse.reference);
        chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
        chai.expect($("#companyNameValue").text()).to.equal(mockCertifiedCopyCheckoutResponse.items[0].companyName);
        chai.expect($("#companyNumberValue").text()).to.equal(mockCertifiedCopyCheckoutResponse.items[0].companyNumber);
        chai.expect($("#deliveryMethodValue").text()).to.equal("Standard (aim to send out within 10 working days)");
        chai.expect($("#deliveryAddressValue").html()).to.equal(MapUtil.mapToHtml(["forename surname", "company name",
            "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
        chai.expect($("#filingHistoryDateValue1").text().trim()).to.equal("12 Feb 2010");
        chai.expect($("#filingHistoryTypeValue1").text().trim()).to.equal("CH01");
        chai.expect($("#filingHistoryDescriptionValue1").text().trim()).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
        chai.expect($("#filingHistoryFeeValue1").text().trim()).to.equal("£15");
        chai.expect($("#filingHistoryDateValue2").text().trim()).to.equal("12 Mar 2009");
        chai.expect($("#filingHistoryTypeValue2").text().trim()).to.equal("AA");
        chai.expect($("#filingHistoryDescriptionValue2").text().trim()).to.equal("Group of companies' accounts made up to 31 August 2008");
        chai.expect($("#filingHistoryFeeValue2").text().trim()).to.equal("£15");
        chai.expect($("#paymentAmountValue").text()).to.equal("£30");
        chai.expect($("#paymentReferenceValue").text()).to.equal("q4nn5UxZiZxVG2e");
        chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
        chai.expect(resp.text).to.not.contain("certificateTypeValue");
        chai.expect(resp.text).to.not.contain("includedOnCertificateValue");
        chai.expect(getPaymentStub).to.have.been.called;
        chai.expect(getOrderStub).to.have.been.called;
        chai.expect(getBasketLinksStub).to.have.been.called;
    });

    it("renders get order page on successful get checkout call for a missing image delivery order", async () => {
        getKeyStub = sinon.stub(redisUtils, 'getKey');
        getKeyStub.resolves('q4nn5UxZiZxVG2e');
        
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockMissingImageDeliveryCheckoutResponse
        }
        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));
        getBasketStub = sandbox.stub(apiClient, "getBasket")
        .returns(Promise.resolve({ enrolled: true }));

        const certificatePaymentResponse: ApiResponse<Payment> = {
            httpStatusCode: 200,
            resource: mockPaymentResponse,
        }
        getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
            certificatePaymentResponse,
        ));

        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=missing-image-delivery`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        const $ = cheerio.load(resp.text);
        verifyServiceLinkRenderedCorrectly($);

        chai.expect(resp.status).to.equal(200);
        chai.expect($("#orderReference").text()).to.equal(mockMissingImageDeliveryCheckoutResponse.reference);
        chai.expect($("#orderReference").attr("aria-label")).to.equal(ORDER_ID_ARIA_LABEL);
        chai.expect($("#companyNameValue").text()).to.equal(mockMissingImageDeliveryCheckoutResponse.items[0].companyName);
        chai.expect($("#companyNumberValue").text()).to.equal(mockMissingImageDeliveryCheckoutResponse.items[0].companyNumber);
        chai.expect($("#filingHistoryDateValue").text().trim()).to.equal("26 May 2015");
        chai.expect($("#filingHistoryTypeValue").text().trim()).to.equal("AP01");
        chai.expect($("#filingHistoryDescriptionValue").text().trim()).to.equal("Appointment of Mr Richard John Harris as a director");
        chai.expect($("#paymentAmountValue").text()).to.equal("£3");
        chai.expect($("#paymentReferenceValue").text()).to.equal(mockMissingImageDeliveryCheckoutResponse.paymentReference);
        chai.expect($("#paymentTimeValue").text()).to.equal("16 December 2019 - 09:16:17");
        chai.expect(resp.text).to.not.contain("certificateTypeValue");
        chai.expect(resp.text).to.not.contain("includedOnCertificateValue");
        chai.expect(getPaymentStub).to.have.been.called;
        chai.expect(getOrderStub).to.have.been.called;
        chai.expect(getBasketLinksStub).to.have.been.called;
    });
    it("should throw InternalServerError if query param reference and payment api refeernce do not match", (done) => {
        getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');
        
       
        const wrongRef = "orderable_item_WRONG-REF";
        const correctRef = "orderable_item_CORRECT-REF";

        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockMissingImageDeliveryCheckoutResponse
        }

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));

        getBasketStub = sandbox.stub(apiClient, "getBasket")
        .returns(Promise.resolve({ enrolled: true }));
      
        const mismatchedPayment: Payment = {
          ...mockPaymentResponse,
          reference: correctRef,
          status: "paid"
        };
      
        const certificatePaymentResponse: ApiResponse<Payment> = {
          httpStatusCode: 200,
          resource: mismatchedPayment
        };
      
        sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(certificatePaymentResponse));
      
        chai.request(testApp)
          .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${wrongRef}&state=1234&status=paid&itemType=missing-image-delivery`)
          .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
          .end((err, res) => {
           
            expect(res).to.have.status(500);
            done();
          });
        });


    it("should throw InternalServerError if query param status and payment api status do not match", (done) => {
        getKeyStub = sinon.stub(redisUtils, 'getKey');
            getKeyStub.resolves('q4nn5UxZiZxVG2e');
        const queryParamstatus = "paid";
        const apiStatus = "failed";

      
        const mismatchedPayment: Payment = {
          ...mockPaymentResponse,
          status: apiStatus
        };
      
        const certificatePaymentResponse: ApiResponse<Payment> = {
          httpStatusCode: 200,
          resource: mismatchedPayment
        };
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockMissingImageDeliveryCheckoutResponse
        }

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));

        getBasketStub = sandbox.stub(apiClient, "getBasket")
        .returns(Promise.resolve({ enrolled: true }));
      
      
        sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(certificatePaymentResponse));
      
        chai.request(testApp)
          .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=${queryParamstatus}&itemType=missing-image-delivery`)
          .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
          .end((err, res) => {
           
            expect(res).to.have.status(500);
            done();
          });
        });

        it("should throw InternalServerError if payment reference not present in Redis", (done) => {
            getKeyStub = sinon.stub(redisUtils, 'getKey');
                getKeyStub.resolves('');
    
                const checkoutResponse: ApiResponse<Checkout> = {
                    httpStatusCode: 200,
                    resource: mockMissingImageDeliveryCheckoutResponse
                }
                getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
                getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                    data: {
                        enrolled: false
                    }
                } as BasketLinks));
                getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));
        
                const certificatePaymentResponse: ApiResponse<Payment> = {
                    httpStatusCode: 200,
                    resource: mockPaymentResponse,
                }
                getPaymentStub = sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(
                    certificatePaymentResponse,
                ));
                
                chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid&itemType=missing-image-delivery`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .end((err, res) => {
                 
                  expect(res).to.have.status(500);
                  done();
                });
              });


    it("redirects and applies the itemType query param if user disenrolled", async () => {
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockCertificateCheckoutResponse
        }

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));

        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=ff7fa274-1556-4495-b7d6-09897d877b8c&status=paid`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .redirects(0);
        chai.expect(resp).to.redirectTo(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=ff7fa274-1556-4495-b7d6-09897d877b8c&status=paid&itemType=certificate`);
    });

    it("redirects and applies the itemTypes query param if user enrolled when a certificate is ordered on the confirmation page", async () => {
        const checkoutResponse: ApiResponse<Checkout> = {
            httpStatusCode: 200,
            resource: mockCertificateCheckoutResponse
        }

        getOrderStub = sandbox.stub(apiClient, "getCheckout").returns(Promise.resolve(checkoutResponse));
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: true
            }
        } as BasketLinks));

        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=ff7fa274-1556-4495-b7d6-09897d877b8c&status=paid`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .redirects(0);
        chai.expect(resp).to.redirectTo(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=ff7fa274-1556-4495-b7d6-09897d877b8c&status=paid&itemTypes=1`);
    });

    it("renders an error page if get order fails", (done) => {
        getOrderStub = sandbox.stub(apiClient, "checkoutBasket").throws(new Error("ERROR"));
        chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=paid`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .end((err, resp) => {
                if (err) return done(err);
                chai.expect(resp.status).to.equal(500);
                done();
            });
    });

    ITEM_KINDS.forEach((itemKind) => {
        const basketCancelledFailedResponse = {
            deliveryDetails: {
                addressLine1: "117 kings road",
                addressLine2: "canton",
                country: "wales",
                forename: "John",
                locality: "Cardiff",
                poBox: "po box",
                postalCode: "CF5 3NB",
                region: "Glamorgan",
                surname: "Smith"
            },
            etag: "etag",
            items: [{
                itemOptions: {certificateType: "incorporation-with-all-name-changes"},
                itemUri: itemKind.url,
                kind: itemKind.kind,
                links: {self: itemKind.url}
            }]
        } as unknown as Basket;

        it("redirects to " + itemKind.name + " check details page if status is cancelled and item type is " + itemKind.name, async () => {
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: false
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketCancelledFailedResponse));
            const resp = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=ff7fa274-1556-4495-b7d6-09897d877b8c&status=cancelled&itemType=${itemKind.name}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);
            chai.expect(resp.text).to.include(`${itemKind.url}/check-details`);
        });

        it("redirects to " + itemKind.name + " check details page if status is failed and item type is " + itemKind.name, async () => {
            getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
                data: {
                    enrolled: false
                }
            } as BasketLinks));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketCancelledFailedResponse));
            const resp = await chai.request(testApp)
                .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=failed&itemType=${itemKind.name}`)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);
            chai.expect(resp.text).to.include(`${itemKind.url}/check-details`);
        });
    });

    const dissolvedCertificatebasketCancelledFailedResponse = {
        deliveryDetails: {
            addressLine1: "117 kings road",
            addressLine2: "canton",
            country: "wales",
            forename: "John",
            locality: "Cardiff",
            poBox: "po box",
            postalCode: "CF5 3NB",
            region: "Glamorgan",
            surname: "Smith"
        },
        etag: "etag",
        items: [{
            itemOptions: {
                certificateType: "dissolution"
            },
            itemUri: "/orderable/certificates/CRT-123456-123456",
            kind: "item#certificate",
            links: {self: "item#certificate"},
            itemId: "CRT-123456-123456"
        }]
    } as unknown as Basket;

    it("redirects to dissolved certificates check details page if status is cancelled", async () => {
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));
        getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(dissolvedCertificatebasketCancelledFailedResponse));
        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=cancelled&itemType=dissolved-certificate`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .redirects(0);
        chai.expect(resp.text).to.include(`/orderable/dissolved-certificates/${dissolvedCertificatebasketCancelledFailedResponse.items?.[0].id}/check-details`);
    });

    it("redirects to dissolved certificates check details page if status is failed", async () => {
        getBasketLinksStub = sandbox.stub(apiClient, "getBasketLinks").returns(Promise.resolve({
            data: {
                enrolled: false
            }
        } as BasketLinks));
        getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(dissolvedCertificatebasketCancelledFailedResponse));
        const resp = await chai.request(testApp)
            .get(`/orders/${ORDER_ID}/confirmation?ref=orderable_item_${ORDER_ID}&state=1234&status=failed&itemType=dissolved-certificate`)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .redirects(0);
        chai.expect(resp.text).to.include(`/orderable/dissolved-certificates/${dissolvedCertificatebasketCancelledFailedResponse.items?.[0].id}/check-details`);
    });

    it("should throw InternalServerError if query param reference and payment api refeernce do not match", (done) => {
        const wrongRef = "orderable_item_WRONG-REF";
        const correctRef = "orderable_item_CORRECT-REF";
      
        const mismatchedPayment: Payment = {
          ...mockPaymentResponse,
          reference: correctRef,
          status: "paid"
        };
      
        const certificatePaymentResponse: ApiResponse<Payment> = {
          httpStatusCode: 200,
          resource: mismatchedPayment
        };
      
        sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(certificatePaymentResponse));
      
        chai.request(testApp)
          .get(`/orders/${ORDER_ID}/confirmation?ref=${wrongRef}&status=paid&itemType=certificate`)
          .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
          .end((err, res) => {
           
            expect(res).to.have.status(500);
            done();
          });
      });


    it("should throw InternalServerError if query param status and payment api status do not match", (done) => {
        const queryParamstatus = "paid";
        const apiStatus = "failed";
      
        const mismatchedPayment: Payment = {
          ...mockPaymentResponse,
          status: apiStatus
        };
      
        const certificatePaymentResponse: ApiResponse<Payment> = {
          httpStatusCode: 200,
          resource: mismatchedPayment
        };
      
        sandbox.stub(apiClient, "getPaymentStatus").returns(Promise.resolve(certificatePaymentResponse));
      
        chai.request(testApp)
          .get(`/orders/${ORDER_ID}/confirmation?ref=${queryParamstatus}&status=paid&itemType=certificate`)
          .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
          .end((err, res) => {
           
            expect(res).to.have.status(500);
            done();
          });
      });
    });
      

const verifyServiceLinkRenderedCorrectly = ($: cheerio.Root) => {
    chai.expect($(".govuk-header__content").text()).to.contain("Find and update company information");
    chai.expect($(".govuk-header__content").children().attr("href")).to.equal("http://chsurl.co");
};
