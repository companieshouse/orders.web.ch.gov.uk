import {
    BASKET_RE,
    extractValueFromRequestField, extractValueIfPresentFromRequestField,
    getWhitelistedReturnToURL,
    ORDER_CONFIRMATION_RE, ORDER_ITEM_SUMMARY_RE, ORDER_SUMMARY_RE,
    ORDERS_RE
} from "../../utils/request.util";
import { expect } from "chai";
import { ORDER_CONFIRMATION } from "./constants";
import { BASKET, ORDERS } from "../../model/page.urls";

const UNKNOWN_URL = "/unknown";
const ORDER_SUMMARY_URL = "/orders/ORD-123123-123123";
const ORDER_ITEM_SUMMARY_URL = "/orders/ORD-123123-123123/items/MID-123123-123123";

describe("request.util.unit",
    () => {
        describe("extractValueFromRequestField", () => {
            it("gets correct return to URL for orders page", () => {
                const returnToUrl = extractValueFromRequestField(ORDERS, ORDERS_RE);
                expect(returnToUrl).to.equal(ORDERS);
            });

            it("gets correct return to URL for order summary page", () => {
                const returnToUrl = extractValueFromRequestField(ORDER_SUMMARY_URL, ORDER_SUMMARY_RE);
                expect(returnToUrl).to.equal(ORDER_SUMMARY_URL);
            });

            it("gets correct return to URL for order item summary page", () => {
                const returnToUrl = extractValueFromRequestField(ORDER_ITEM_SUMMARY_URL, ORDER_ITEM_SUMMARY_RE);
                expect(returnToUrl).to.equal(ORDER_ITEM_SUMMARY_URL);
            });

            it("gets correct return to URL for order complete page", () => {
                const returnToUrl = extractValueFromRequestField(ORDER_CONFIRMATION, ORDER_CONFIRMATION_RE);
                expect(returnToUrl).to.equal(ORDER_CONFIRMATION);
            });

            it("gets correct return to URL for basket page", () => {
                const returnToUrl = extractValueFromRequestField(BASKET, BASKET_RE);
                expect(returnToUrl).to.equal(BASKET);
            });

            it("errors if asked to look up an unknown page URL", () => {
                const execution = () => extractValueFromRequestField(UNKNOWN_URL, ORDERS_RE);
                expect(execution).to.throw("Unable to extract value sought from requestField /unknown using regular expression /\\/orders/");
            });
        });

        describe("extractValueIfPresentFromRequestField", () => {
            it("gets correct return to URL for orders page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(ORDERS, ORDERS_RE);
                expect(returnToUrl).to.equal(ORDERS);
            });

            it("gets correct return to URL for order summary page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(ORDER_SUMMARY_URL, ORDER_SUMMARY_RE);
                expect(returnToUrl).to.equal(ORDER_SUMMARY_URL);
            });

            it("gets correct return to URL for order item summary page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(ORDER_ITEM_SUMMARY_URL, ORDER_ITEM_SUMMARY_RE);
                expect(returnToUrl).to.equal(ORDER_ITEM_SUMMARY_URL);
            });

            it("gets correct return to URL for order complete page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(ORDER_CONFIRMATION, ORDER_CONFIRMATION_RE);
                expect(returnToUrl).to.equal(ORDER_CONFIRMATION);
            });

            it("gets correct return to URL for basket page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(BASKET, BASKET_RE);
                expect(returnToUrl).to.equal(BASKET);
            });

            it("returns null if asked to look up an unknown page URL", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(UNKNOWN_URL, ORDERS_RE);
                expect(returnToUrl).to.equal(null);
            });
        });

        describe("getWhitelistedReturnToURL", () => {
            it("gets correct return to URL for orders page", () => {
                const returnToUrl = getWhitelistedReturnToURL(ORDERS);
                expect(returnToUrl).to.equal(ORDERS);
            });

            it("gets correct return to URL for order summary page", () => {
                const returnToUrl = getWhitelistedReturnToURL(ORDER_SUMMARY_URL);
                expect(returnToUrl).to.equal(ORDER_SUMMARY_URL);
            });

            it("gets correct return to URL for order item summary page", () => {
                const returnToUrl = getWhitelistedReturnToURL(ORDER_ITEM_SUMMARY_URL);
                expect(returnToUrl).to.equal(ORDER_ITEM_SUMMARY_URL);
            });

            it("gets correct return to URL for order complete page", () => {
                const returnToUrl = getWhitelistedReturnToURL(ORDER_CONFIRMATION);
                expect(returnToUrl).to.equal(ORDER_CONFIRMATION);
            });

            it("gets correct return to URL for basket page", () => {
                const returnToUrl = getWhitelistedReturnToURL(BASKET);
                expect(returnToUrl).to.equal(BASKET);
            });

            it("errors if asked to look up an unknown page URL", () => {
                const execution = () => getWhitelistedReturnToURL(UNKNOWN_URL);
                expect(execution).to.throw();
            });
        });
    });
