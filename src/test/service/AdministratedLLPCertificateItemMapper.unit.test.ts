import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {expect} from "chai";
import { AdministratedLLPCertificateItemMapper } from "../../service/AdministratedLLPCertificateItemMapper";

describe("Administrated LLP certificate item mapper tests", () => {

    const administratedOtherCertificateItemMapper: AdministratedLLPCertificateItemMapper = new AdministratedLLPCertificateItemMapper;

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
                    administratorsDetails: {
                        includeBasicInformation: true
                    }
                } as CertificateItemOptions
            }

            // when
            const expected = administratedOtherCertificateItemMapper.getOrdersDetailTable(item)

            // then
            expect(expected.length).to.equal(7)
            expect(expected[6].key.text).to.equal("Administrators' details")
        })
    })
});
