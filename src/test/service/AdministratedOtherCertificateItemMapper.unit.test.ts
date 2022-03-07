import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {AdministratedOtherCertificateItemMapper} from "../../service/AdministratedOtherCertificateItemMapper";
import {expect} from "chai";

describe("Administrated other certificate item mapper tests", () => {

    const administratedOtherCertificateItemMapper: AdministratedOtherCertificateItemMapper = new AdministratedOtherCertificateItemMapper;

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
                    administratorsDetails: {
                        includeBasicInformation: true
                    }
                } as CertificateItemOptions
            }

            // when
            const expected = administratedOtherCertificateItemMapper.getOrdersDetailTable(item)

            // then
            expect(expected.length).to.equal(8)
            expect(expected[7].key.text).to.equal("Administrators' details")
        })
    })
});
