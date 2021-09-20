import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {LPCertificateItemMapper} from "../../service/LPCertificateItemMapper";
import {expect} from "chai";
import {AddressRecordsType} from "../../model/AddressRecordsType";

describe("mapPrincipalPlaceOfBusiness", () => {

    const lpCertificateItemMapper: LPCertificateItemMapper = new LPCertificateItemMapper;

    const itemOptions = {
        principalPlaceOfBusinessDetails: {
            includeAddressRecordsType: "current"
        }
    } as CertificateItemOptions;

    it("includeAddressRecordsType with a value of 'current' returns correct mapped text", () => {
        const itemOptions = {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT
            }
        } as CertificateItemOptions;
        const result = lpCertificateItemMapper.mapPrincipalPlaceOfBusiness(itemOptions);
        expect(result).to.equal("Current address");
    });

    it("includeAddressRecordsType with a value of 'current-and-previous' returns correct mapped text", () => {
        const itemOptions = {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT_AND_PREVIOUS
            }
        } as CertificateItemOptions;
        const result = lpCertificateItemMapper.mapPrincipalPlaceOfBusiness(itemOptions);
        expect(result).to.equal("Current address and the one previous");
    });

    it("includeAddressRecordsType with a value of 'current-previous-and-prior' returns correct mapped text", () => {
        const itemOptions = {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR
            }
        } as CertificateItemOptions;
        const result = lpCertificateItemMapper.mapPrincipalPlaceOfBusiness(itemOptions);
        expect(result).to.equal("Current address and the two previous");
    });

    it("includeAddressRecordsType with a value of 'all' returns correct mapped text", () => {
        const itemOptions = {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.ALL
            }
        } as CertificateItemOptions;
        const result = lpCertificateItemMapper.mapPrincipalPlaceOfBusiness(itemOptions);
        expect(result).to.equal("All current and previous addresses");
    });

    it("includeAddressRecordsType with a value of undefined returns correct mapped text", () => {
        const itemOptions = {
            principalPlaceOfBusinessDetails: {}
        } as CertificateItemOptions;
        const result = lpCertificateItemMapper.mapPrincipalPlaceOfBusiness(itemOptions);
        expect(result).to.equal("No");
    });
});
