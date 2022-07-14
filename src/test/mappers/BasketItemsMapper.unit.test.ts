import { BasketItemsMapper } from "../../mappers/BasketItemsMapper";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { expect } from "chai";
import { SERVICE_NAME_BASKET } from "../../config/config";
import { ItemOptions, LinksResource } from "@companieshouse/api-sdk-node/src/services/order/certificates";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { MidItem } from "@companieshouse/api-sdk-node/dist/services/order/mid";

const certificateItem: CertificateItem = {
    companyName: "COMPANY LIMITED",
    companyNumber: "12345678",
    customerReference: "customerReference",
    description: "description",
    descriptionIdentifier: "descriptionIdentifier",
    descriptionValues: {
        key: "value"
    },
    etag: "etag",
    id: "CRT-123456-123456",
    itemCosts: [],
    itemOptions: {
        certificateType: "incorporation-with-all-company-name-changes",
        deliveryTimescale: "standard"
    } as ItemOptions,
    kind: "item#certificate",
    links: {
        self: "/path/to/certificate"
    },
    postageCost: "10",
    postalDelivery: true,
    quantity: 1,
    totalItemCost: "15"
};

const certifiedCopyItem = {
    companyName: "COMPANY LIMITED",
    companyNumber: "12345678",
    itemOptions: {
        filingHistoryDocuments: [{
            filingHistoryType: "AP01",
            filingHistoryDescriptionValues: {
                officer_name: "Tom"
            },
            filingHistoryDescription: "appoint-person-director-company",
            filingHistoryDate: "2022-01-01T12:00",
            filingHistoryCost: "15",
            filingHistoryId: "id"
        }],
        deliveryTimescale: "standard",
        deliveryMethod: "postal"
    },
    totalItemCost: "15",
    kind: "item#certified-copy"
} as CertifiedCopyItem;

const missingImageDeliveryItem: MidItem = {
    companyName: "COMPANY LIMITED",
    companyNumber: "12345678",
    customerReference: "customerReference",
    description: "description",
    descriptionIdentifier: "descriptionIdentifier",
    descriptionValues: {
        key: "value"
    },
    etag: "F00DFACE",
    id: "CCD-123456-123456",
    itemCosts: [],
    itemOptions: {
        filingHistoryType: "CH01",
        filingHistoryDescriptionValues: {
            officer_name: "Tom"
        },
        filingHistoryDescription: "change-person-director-company",
        filingHistoryDate: "2022-02-01T12:00",
        filingHistoryId: "id"
    },
    kind: "item#missing-image-delivery",
    links: {
        self: "/path/to/missing-image-delivery"
    },
    postageCost: "0",
    postalDelivery: false,
    quantity: 1,
    totalItemCost: "3"

};

describe("BasketItemsMapper", () => {
    describe("mapBasketItems", () => {
        it("Returns an empty view model with delivery details attached if basket has no items", () => {
            // given
            const mapper = new BasketItemsMapper();
            const basket = {
                deliveryDetails: {
                    forename: "forename"
                }
            } as Basket;

            // when
            const actual = mapper.mapBasketItems(basket);

            // then
            expect(actual.certificates).to.be.empty;
            expect(actual.certifiedCopies).to.be.empty;
            expect(actual.missingImageDelivery).to.be.empty;
            expect(actual.deliveryDetailsTable).to.not.be.empty;
            expect(actual.serviceName).to.equal(SERVICE_NAME_BASKET);
            expect(actual.totalItemCost).to.equal(0);
        });

        it("Returns a view model with items grouped by item type and delivery details", () => {
            // given
            const mapper = new BasketItemsMapper();
            const basket = {
                deliveryDetails: {
                    forename: "forename",
                    surname: "surname",
                    addressLine1: "address line 1",
                    locality: "locality",
                    postalCode: "AB01 1XY",
                    country: "country"
                },
                items: [certificateItem, certifiedCopyItem, missingImageDeliveryItem],
                enrolled: true
            } as Basket;

            // when
            const actual = mapper.mapBasketItems(basket);

            // then
            expect(actual.certificates).to.deep.contain([
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
            expect(actual.certifiedCopies).to.deep.contain([
                {
                    text: "01 Jan 2022"
                },
                {
                    text: "AP01"
                },
                {
                    text: "Appointment of a director"
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
                    html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
                }
            ]);
            //Director's details changed
            expect(actual.missingImageDelivery).to.deep.contain([
                {
                    text: "01 Feb 2022"
                },
                {
                    text: "CH01"
                },
                {
                    text: "Director's details changed"
                },
                {
                    text: "12345678"
                },
                {
                    text: "£3"
                },
                {
                    html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
                }
            ]);
            expect(actual.deliveryDetailsTable).to.deep.equal([
                {
                    key: {
                        classes: "govuk-!-width-one-half",
                        text: "Delivery address"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: `<p id='deliveryAddressValue'>forename surname<br>address line 1<br>locality<br>AB01 1XY<br>country<br></p>`
                    },
                    actions: {
                        items: [{
                            href: "/delivery-details",
                            text: "Change"
                        }]
                    }
                }
            ]);
            expect(actual.serviceName).to.equal(SERVICE_NAME_BASKET);
            expect(actual.totalItemCost).to.equal(33);
        });
    })
});
