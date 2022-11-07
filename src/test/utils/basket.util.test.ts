
import chai from "chai";
import sinon from "sinon";
import { Request } from "express";
import * as apiClient from "../../../src/client/api.client";
import { BasketLink, getBasketLink } from "../../../src/utils/basket.util"
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { signedInSessionData, signedOutSessionData } from "../__mocks__/redis.mocks";
const sandbox = sinon.createSandbox();
// Without this import these tests will not compile.
import { Session } from "@companieshouse/node-session-handler";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { mockCertificateItem } from "../../test/__mocks__/order.mocks";

const getDummyBasket = (enrolled: boolean): Basket => {
    return {
        items: [
            {
                id: "MID-504916-663659",
                companyName: "TEST COMPANY",
                companyNumber: "00000000",
                description: "missing image delivery for company 00000000",
                descriptionIdentifier: "missing-image-delivery",
                descriptionValues: {
                    company_number: "00000000",
                    "missing-image-delivery": "missing image delivery for company 00006400"
                },
                itemCosts: [
                    {
                        discountApplied: "0",
                        itemCost: "3",
                        calculatedCost: "3",
                        productType: "missing-image-delivery-mortgage"
                    }
                ],
                itemOptions: {
                    filingHistoryDate: "1993-08-21",
                    filingHistoryDescription: "legacy",
                    filingHistoryDescriptionValues: {
                        description: "Declaration of satisfaction of mortgage/charge"
                    },
                    filingHistoryId: "MDEzNzQ1OTcyOGFkaXF6a2N4",
                    filingHistoryType: "403a",
                    filingHistoryCategory: "mortgage",
                    filingHistoryCost: "apparently mandatory although missing in actual test case",
                    filingHistoryBarcode: "apparently mandatory although missing in actual test case"
                },
                etag: "356fce2ae4efb689a579dd0f8df3e88c9767c30a",
                kind: "item#missing-image-delivery",
                links: {
                    self: "/orderable/missing-image-deliveries/MID-504916-663659"
                },
                quantity: 1,
                itemUri: "/orderable/missing-image-deliveries/MID-504916-663659",
                status: "unknown",
                postageCost: "0",
                totalItemCost: "3",
                postalDelivery: false
            }
        ],
        enrolled: enrolled
    };
};

const mockItem: Item = {
    ...mockCertificateItem,
    itemOptions: {
        ...mockCertificateItem.itemOptions,
    },
    totalItemCost: "15"
};

describe("getBasketLink", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it.only("should indicate that basket link is not to be rendered where no session present in request", async () => {
        chai.expect(await getBasketLink({} as Request, {enrolled: false})).to.deep.equal(
            { showBasketLink: false }
        );
    });

    it.only("should indicate that basket link is not to be rendered where no session data present in request", async () => {
        chai.expect(await getBasketLink({ session: {} } as Request, {enrolled: false})).to.deep.equal(
            { showBasketLink: false }
        );
    });

    it.only("should indicate that basket link is not to be rendered where no sign in present in request", async () => {
        chai.expect(await getBasketLink({ session: { data: signedOutSessionData } } as Request, {enrolled: false})).to.deep.equal(
            { showBasketLink: false }
        );
    });

    it.only("should indicate that basket link is not to be rendered where the user is not enrolled", async () => {
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(false));
        chai.expect(await getBasketLink({ session: { data: signedInSessionData } } as Request, {enrolled: false, items: [mockItem]})).to.deep.equal(
            {
                showBasketLink: false,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: 1
            }
        );
    });

    it.only("should indicate that basket link is to be rendered where the user is enrolled", async () => {
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));
        chai.expect(await getBasketLink({ session: { data: signedInSessionData } } as Request, {enrolled: true, items: [mockItem]})).to.deep.equal(
            {
                showBasketLink: true,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: 1
            }
        );
    });
});