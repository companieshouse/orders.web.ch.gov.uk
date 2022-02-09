import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {OtherCertificateItemMapper} from "../../service/OtherCertificateItemMapper";
import {expect} from "chai";

describe("Other certificate item mapper tests", () => {

    const otherCertificateItemMapper: OtherCertificateItemMapper = new OtherCertificateItemMapper;

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
                    includeGoodStandingInformation: true,
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    secretaryDetails: {
                        includeBasicInformation: true
                    }
                } as CertificateItemOptions
            }

            // when
            const expected = otherCertificateItemMapper.getOrdersDetailTable(item)

            // then
            expect(expected.length).to.equal(8)
        })
    })
});
