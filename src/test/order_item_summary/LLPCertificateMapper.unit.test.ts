import {
    mockActiveLLPCertificateItemView,
    mockAdministratedLLPCertificateItemView,
    mockCertificateItem,
    mockDissolvedCertificateItem, mockDissolvedLLPCertificateItemView,
    mockLiquidatedLLPCertificateItemView,
    ORDER_ID
} from "../__mocks__/order.mocks";
import { expect } from "chai";
import { LLPCertificateMapper } from "../../order_item_summary/LLPCertificateMapper";
import { ORDER_ITEM_SUMMARY_CERTIFICATE } from "../../model/template.paths";

describe("LLPCertificateMapper", () => {
    describe("map", () => {
        it("Maps a certificate item for an active LLP to a view model", () => {
            // given
            const mapper = new LLPCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "active",
                        companyType: "llp",
                        designatedMemberDetails: {
                            includeBasicInformation: true,
                            includeAddress: false,
                            includeAppointmentDate: false,
                            includeCountryOfResidence: false
                        },
                        memberDetails: {
                            includeBasicInformation: true,
                            includeAddress: false,
                            includeAppointmentDate: false,
                            includeCountryOfResidence: false
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
                data: mockActiveLLPCertificateItemView
            });
        });

        it("Maps a certificate item for an administrated LLP to a view model", () => {
            // given
            const mapper = new LLPCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "administration",
                        companyType: "llp",
                        designatedMemberDetails: {
                            includeBasicInformation: true,
                            includeAddress: true,
                            includeAppointmentDate: true,
                            includeCountryOfResidence: true,
                            includeDobType: "partial"
                        },
                        memberDetails: {
                            includeBasicInformation: true,
                            includeAddress: true,
                            includeAppointmentDate: true,
                            includeCountryOfResidence: true,
                            includeDobType: "partial"
                        },
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
                data: mockAdministratedLLPCertificateItemView
            });
        });

        it("Maps a certificate item for a liquidated LLP to a view model", () => {
            // given
            const mapper = new LLPCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockCertificateItem,
                    itemOptions: {
                        ...mockCertificateItem.itemOptions,
                        companyStatus: "liquidation",
                        companyType: "llp",
                        designatedMemberDetails: {
                        },
                        memberDetails: {
                        },
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
                data: mockLiquidatedLLPCertificateItemView
            });
        });

        it("Maps a certificate item for a dissolved LLP to a view model", () => {
            // given
            const mapper = new LLPCertificateMapper({
                orderId: ORDER_ID,
                item: {
                    ...mockDissolvedCertificateItem,
                    itemOptions: {
                        ...mockDissolvedCertificateItem.itemOptions,
                        companyType: "llp"
                    }
                }
            });

            // when
            mapper.map();
            const actual = mapper.getMappedOrder();

            // then
            expect(actual).to.deep.equal({
                template: ORDER_ITEM_SUMMARY_CERTIFICATE,
                data: mockDissolvedLLPCertificateItemView
            });
        });
    });
});
