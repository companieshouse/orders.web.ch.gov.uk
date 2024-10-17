import { BasketItemsMapper } from "../../mappers/BasketItemsMapper";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { expect } from "chai";
import { SERVICE_NAME_BASKET } from "../../config/config";
import {
    CERTIFICATE_ID,
    mockCertificateItem,
    mockCertifiedCopyItem,
    mockMissingImageDeliveryItem
} from "../__mocks__/order.mocks";

describe("BasketItemsMapper", () => {
    const csrfToken = "TestToken123";

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
            const actual = mapper.mapBasketItems(basket, csrfToken);

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
                items: [{ ...mockCertificateItem, itemOptions: { ...mockCertificateItem.itemOptions, companyType: "ltd" } }, { ...mockCertificateItem, itemOptions: { ...mockCertificateItem.itemOptions, companyType: "llp" } }, { ...mockCertificateItem, itemOptions: { ...mockCertificateItem.itemOptions, companyType: "limited-partnership" } }, mockCertifiedCopyItem, mockMissingImageDeliveryItem],
                enrolled: true
            } as Basket;

            // when
            const actual = mapper.mapBasketItems(basket, csrfToken);

            // then
            expect(actual.certificates).to.deep.equal([[
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Certificate type
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Incorporation with all company name changes
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Company number
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            00000000
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Dispatch method
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Standard
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Quantity
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            1
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Fee
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            £15
                         </span>`
                    )
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><a class="govuk-link"
                              data-event-id="view-change-certificate-options"
                              href="/orderable/certificates/${CERTIFICATE_ID}/view-change-options">
                              View/Change certificate options
                              <span class="govuk-visually-hidden">
                                  Incorporation with all company name changes for 00000000
                              </span>
                           </a></span>`
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><form action="/basket/remove/${mockCertificateItem.id}" method="post">
                                <input type="hidden" name="_csrf" value="${csrfToken}">
                                <input type="submit"
                                       class="removeItem"
                                       data-event-id="remove-item"
                                       value="Remove"
                                       aria-label="Remove Incorporation with all company name changes certificate for 00000000">
                         </form></span>`
                }
            ], [
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Certificate type
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Incorporation with all company name changes
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Company number
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            00000000
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Dispatch method
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Standard
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Quantity
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            1
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Fee
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            £15
                         </span>`
                    )
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><a class="govuk-link"
                              data-event-id="view-change-certificate-options"
                              href="/orderable/llp-certificates/${CERTIFICATE_ID}/view-change-options">
                              View/Change certificate options
                              <span class="govuk-visually-hidden">
                                  Incorporation with all company name changes for 00000000
                              </span>
                           </a></span>`
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><form action="/basket/remove/${mockCertificateItem.id}" method="post">
                                <input type="hidden" name="_csrf" value="${csrfToken}">
                                <input type="submit"
                                       class="removeItem"
                                       data-event-id="remove-item"
                                       value="Remove"
                                       aria-label="Remove Incorporation with all company name changes certificate for 00000000">
                         </form></span>`
                }
            ], [
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Certificate type
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Incorporation with all company name changes
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Company number
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            00000000
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Dispatch method
                        </span>
                        <span class="responsive-table__cell" aria-hidden="false">
                            Standard
                        </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Quantity
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            1
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Fee
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            £15
                         </span>`
                    )
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><a class="govuk-link"
                              data-event-id="view-change-certificate-options"
                              href="/orderable/lp-certificates/${CERTIFICATE_ID}/view-change-options">
                              View/Change certificate options
                              <span class="govuk-visually-hidden">
                                  Incorporation with all company name changes for 00000000
                              </span>
                           </a></span>`
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><form action="/basket/remove/${mockCertificateItem.id}" method="post">
                                <input type="hidden" name="_csrf" value="${csrfToken}">
                                <input type="submit"
                                       class="removeItem"
                                       data-event-id="remove-item"
                                       value="Remove"
                                       aria-label="Remove Incorporation with all company name changes certificate for 00000000">
                         </form></span>`
                }
            ]]);
            expect(actual.certifiedCopies[0]).to.deep.equal([
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Date Filed
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            12 Feb 2010
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Type
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            CH01
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Description
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Director's details changed for Thomas David Wheare on 12 February 2010
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Company Number
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            00000000
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Dispatch method
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Standard
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Fee
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            £30
                         </span>`
                    )
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><form action="/basket/remove/${mockCertifiedCopyItem.id}" method="post">
                                <input type="hidden" name="_csrf" value="${csrfToken}">
                                <input type="submit"
                                       class="removeItem"
                                       data-event-id="remove-item"
                                       value="Remove"
                                       aria-label="Remove Certified Document Director's details changed for Thomas David Wheare on 12 February 2010 for 00000000">
                            </form></span>`
                }
            ]);
            // Director's details changed
            expect(actual.missingImageDelivery[0]).to.deep.equal([
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Date Filed
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            26 May 2015
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Type
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            AP01
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Description
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            Appointment of Mr Richard John Harris as a director
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Company Number
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            00000000
                         </span>`
                    )
                },
                {
                    html: flatten(
                        `<span class="responsive-table__heading" aria-hidden="false">
                            Fee
                         </span>
                         <span class="responsive-table__cell" aria-hidden="false">
                            £3
                         </span>`
                    )
                },
                {
                    html: `<span class="responsive-table__cell" aria-hidden="false"><form action="/basket/remove/${mockMissingImageDeliveryItem.id}" method="post">
                            <input type="hidden" name="_csrf" value="${csrfToken}">
                            <input type="submit"
                                   class="removeItem"
                                   data-event-id="remove-item"
                                   value="Remove"
                                   aria-label="Remove Missing Image Delivery Appointment of Mr Richard John Harris as a director for 00000000">
                         </form></span>`
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
                        html: `<p id='delivery-address-value'>forename surname<br>address line 1<br>locality<br>AB01 1XY<br>country<br></p>`
                    },
                    actions: {
                        items: [{
                            attributes: {
                                "data-event-id": "change-delivery-address",
                                id: "change-delivery-details"
                            },
                            href: "/delivery-details",
                            text: "Change"
                        }]
                    }
                }
            ]);
            expect(actual.serviceName).to.equal(SERVICE_NAME_BASKET);
            expect(actual.totalItemCost).to.equal(78);
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
            const execution = () => mapper.mapBasketItems(basket, csrfToken);

            // then
            expect(execution).to.throw("Unknown item type: [item]");
        });
    });

    // Replaces all whitespace with a single space, removes spaces before or after HTML elements.
    const flatten = (html : string) => {
        return html.replace(/\s\s+/g, " ").replace(/> /g, ">").replace(/ </g, "<");
    };
});
