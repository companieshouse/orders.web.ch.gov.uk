import { BasketItemsMapper } from "../../mappers/BasketItemsMapper";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { expect } from "chai";
import { SERVICE_NAME_BASKET } from "../../config/config";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";

describe("BasketItemsMapper", () => {
    describe("mapBasketItems", () => {
        it("Returns an empty view model if basket has no items", () => {
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
            expect(actual.deliveryDetailsTable).to.be.undefined;
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
                items: [mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem],
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
                    text: "00000000"
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
                    html: `<form action="/basket/remove/${mockCertificateItem.id}" method="put">
                                <button type="submit" class="govuk-button" value="Remove">Remove</button>
                            </form>`
                }
            ]);
            expect(actual.certifiedCopies).to.deep.contain([
                {
                    text: "12 Feb 2010"
                },
                {
                    text: "CH01"
                },
                {
                    text: "Director's details changed for Thomas David Wheare on 12 February 2010"
                },
                {
                    text: "00000000"
                },
                {
                    text: "Standard delivery (aim to dispatch within 10 working days)"
                },
                {
                    text: "£30"
                },
                {
                    html: `<form action="/basket/remove/${mockCertifiedCopyItem.id}" method="put">
                                <button type="submit" class="govuk-button" value="Remove">Remove</button>
                            </form>`
                }
            ]);
            //Director's details changed
            expect(actual.missingImageDelivery).to.deep.contain([
                {
                    text: "26 May 2015"
                },
                {
                    text: "AP01"
                },
                {
                    text: "Appointment of Mr Richard John Harris as a director"
                },
                {
                    text: "00000000"
                },
                {
                    text: "£3"
                },
                {
                    html: `<form action="/basket/remove/${mockMissingImageDeliveryItem.id}" method="put">
                                <button type="submit" class="govuk-button" value="Remove">Remove</button>
                            </form>`
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
            expect(actual.totalItemCost).to.equal(48);
        });

        it("Throws an exception if an unrecognised item is mapped", () => {
            // given
            const mapper = new BasketItemsMapper();
            const basket = {
                deliveryDetails: {
                    forename: "forename"
                },
                items: [{
                    kind: "item"
                }]
            } as Basket;

            // when
            const execution = () => mapper.mapBasketItems(basket);

            // then
            expect(execution).to.throw("Unknown item type: [item]");
        });
    })
});
