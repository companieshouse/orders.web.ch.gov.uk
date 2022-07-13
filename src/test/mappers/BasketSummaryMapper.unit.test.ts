import { before, it } from "mocha";
import { BasketSummaryMapper, BasketSummaryViewModel } from "../../mappers/BasketSummaryMapper";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { ItemOptions, LinksResource } from "../../../../../../api-sdk-node/src/services/order/certificates";
import { DeliveryDetails } from "../../../../../../api-sdk-node/dist/services/order/basket";
import { expect } from "chai";

describe("Basket summary mapper tests", () => {
    before(() => {
        process.env.DISPATCH_DAYS = "10";
    });
    describe("mapCertificateToViewModel", () => {
        it("successfully maps each certificate to a view model", () => {
            const viewModel: BasketSummaryViewModel = {
                certificates: [] as any[][],
                certifiedCopies: [] as any[][],
                missingImageDelivery: [] as any[][],
                totalItemCost: 0,
                deliveryDetailsTable: null,
                hasDeliverableItems: false,
                serviceName: "Basket"
            };

            const item: Item = {
                itemUri: "itemURI",
                status: "status",
                companyName: "ACME LTD",
                companyNumber: "12345678",
                description: "description",
                descriptionIdentifier: "description id",
                descriptionValues: {
                    description: "value"
                },
                etag: "etag",
                id: "id",
                itemCosts: [],
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    deliveryTimescale: "standard"
                } as ItemOptions,
                kind: "kind",
                links: {} as LinksResource,
                postageCost: "postageCost",
                postalDelivery: false,
                quantity: 1,
                totalItemCost: "15"
            };

            const deliveryDetails: DeliveryDetails = {
                addressLine1: "test",
                country: "test",
                forename: "tester",
                locality: "test",
                surname: "tester"
            };

            const mapper = new BasketSummaryMapper(viewModel, item, deliveryDetails);
            mapper.mapCertificateToViewModel();

            expect(viewModel.certificates).to.deep.contain([
                {
                    text: "Incorporation with all company name changes"
                },
                {
                    text: "12345678"
                },
                {
                    text: "Standard delivery (aim to dispatch within 10 working days)"
                },
                {
                    text: "£15"
                },
                {
                    html: `<a class="govuk-link" href="javascript:void(0)">View/Change certificate options</a>`
                },
                {
                    html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
                }
            ]);
        });
    });
});
