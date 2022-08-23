import { OtherCompanyTypesCertificateMapper } from "../../order_item_summary/OtherCompanyTypesCertificateMapper";
import {
    mockActiveLtdCertificateItemView,
    mockAdministratedLtdCertificateItemView,
    mockCertificateItem,
    mockDissolvedCertificateItem,
    mockDissolvedLtdCertificateItemView,
    mockLiquidatedLtdCertificateItemView,
    ORDER_ID
} from "../__mocks__/order.mocks";
import { expect } from "chai";
import { ORDER_ITEM_SUMMARY_CERTIFICATE } from "../../model/template.paths";

describe("OtherCompanyTypesCertificateMapper", () => {
    describe("map", () => {
        it("Maps a certificate item for an active limited company to a view model", () => {
            // given
            const mapper = new OtherCompanyTypesCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "active"
                    }
                }
            });

            // when
            mapper.map();
            const actual = mapper.getMappedOrder();

            // then
            expect(actual).to.deep.equal({
                template: ORDER_ITEM_SUMMARY_CERTIFICATE,
                data: mockActiveLtdCertificateItemView
            });
        });

        it("Maps a certificate item for an administrated limited company to a view model", () => {
            // given
            const mapper = new OtherCompanyTypesCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "administration",
                        administratorsDetails: {
                        }
                    }
                }
            });

            // when
            mapper.map();
            const actual = mapper.getMappedOrder();

            // then
            expect(actual).to.deep.equal({
                template: ORDER_ITEM_SUMMARY_CERTIFICATE,
                data: mockAdministratedLtdCertificateItemView
            });
        });

        it("Maps a certificate item for a liquidated limited company to a view model", () => {
            // given
            const mapper = new OtherCompanyTypesCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "liquidation",
                        liquidatorsDetails: {
                            includeBasicInformation: true
                        }
                    }
                }
            });

            // when
            mapper.map();
            const actual = mapper.getMappedOrder();

            // then
            expect(actual).to.deep.equal({
                template: ORDER_ITEM_SUMMARY_CERTIFICATE,
                data: mockLiquidatedLtdCertificateItemView
            });
        });

        it("Maps a certificate item for a dissolved limited company to a view model", () => {
            // given
            const mapper = new OtherCompanyTypesCertificateMapper({
                orderId: ORDER_ID,
                item: mockDissolvedCertificateItem
            });

            // when
            mapper.map();
            const actual = mapper.getMappedOrder();

            // then
            expect(actual).to.deep.equal({
                template: ORDER_ITEM_SUMMARY_CERTIFICATE,
                data: mockDissolvedLtdCertificateItemView
            });
        });
    });
});
