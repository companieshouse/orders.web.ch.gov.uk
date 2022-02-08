import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {LPCertificateItemMapper} from "../../service/LPCertificateItemMapper";
import {expect} from "chai";

describe("mapPrincipalPlaceOfBusiness", () => {

    const lpCertificateItemMapper: LPCertificateItemMapper = new LPCertificateItemMapper;

    describe("getOrdersDetailTable", () => {
        it("transforms item into table", () => {
            // given
            const item = {
                companyName: "ACME LTD",
                companyNumber: "12345678",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    includeGoodStandingInformation: true,
                    principalPlaceOfBusinessDetails: {
                        includeAddressRecordsType: "current"
                    },
                    limitedPartnerDetails: {
                        includeBasicInformation: true
                    },
                    generalPartnerDetails: {
                        includeBasicInformation: true
                    },
                    includeGeneralNatureOfBusinessInformation: true
                } as CertificateItemOptions
            }

            // when
            const expected = lpCertificateItemMapper.getOrdersDetailTable(item)

            // then
            expect(expected.length).to.equal(8)
        })
    })
});
