import {ItemOptions as CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {LiquidatedOtherCertificateItemMapper} from "../../service/LiquidatedOtherCertificateItemMapper";
import {expect} from "chai";

describe("Liquidated other certificate item mapper tests", () => {

    const liquidatedOtherCertificateItemMapper: LiquidatedOtherCertificateItemMapper = new LiquidatedOtherCertificateItemMapper;

    describe("getOrdersDetailTable", () => {
        it("transforms item into table", () => {
            // given
            const item = {
                companyName: "ACME LTD",
                companyNumber: "12345678",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    directorDetails: {
                        includeBasicInformation: true
                    },
                    includeCompanyObjectsInformation: true,
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    secretaryDetails: {
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
            expect(expected.length).to.equal(8)
            expect(expected[7].key.text).to.equal("Liquidators' details")
        })
    })
});
