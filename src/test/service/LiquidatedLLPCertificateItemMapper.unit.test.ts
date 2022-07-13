import {ItemOptions as CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {expect} from "chai";
import { LiquidatedLLPCertificateItemMapper } from "../../service/LiquidatedLLPCertificateItemMapper";

describe("Liquidated LLP certificate item mapper tests", () => {

    const liquidatedOtherCertificateItemMapper: LiquidatedLLPCertificateItemMapper = new LiquidatedLLPCertificateItemMapper;

    describe("getOrdersDetailTable", () => {
        it("transforms item into table", () => {
            // given
            const item = {
                companyName: "ACME LTD",
                companyNumber: "12345678",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    },
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    memberDetails: {
                        includeBasicInformation: true
                    },
                    liquidatorsDetails: {
                        includeBasicInformation: true
                    }
                } as CertificateItemOptions
            }

            // when
            const expected = liquidatedOtherCertificateItemMapper.getOrdersDetailTable(item)

            // then
            expect(expected.length).to.equal(7)
            expect(expected[6].key.text).to.equal("Liquidators' details")
        })
    })
});
