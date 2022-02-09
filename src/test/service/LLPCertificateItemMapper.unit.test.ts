import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {expect} from "chai";
import {LLPCertificateItemMapper} from "../../service/LLPCertificateItemMapper";

describe("LLPCertificateItemMapper unit tests", () => {

    const llpCertificateItemMapper: LLPCertificateItemMapper = new LLPCertificateItemMapper;

    describe("getOrdersDetailTable", () => {
        it("transforms item into table", () => {
            // given
            const item = {
                companyName: "ACME LTD",
                companyNumber: "12345678",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    includeGoodStandingInformation: true,
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    },
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    memberDetails: {
                        includeBasicInformation: true
                    }
                } as CertificateItemOptions
            }

            // when
            const expected = llpCertificateItemMapper.getOrdersDetailTable(item)

            // then
            expect(expected.length).to.equal(7)
        })
    })
});
