import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {OtherCertificateItemMapper} from "../../service/OtherCertificateItemMapper";
import {expect} from "chai";
import {MapUtil} from "../../service/MapUtil";

describe("Other certificate item mapper tests", () => {

    const otherCertificateItemMapper: OtherCertificateItemMapper = new OtherCertificateItemMapper;

    describe("mapRegisteredOfficeAddress", () => {

        const itemOptionsRegOfficeAddress = (addressRecordsType: string): CertificateItemOptions => {
            return {
                directorDetails: {
                    includeBasicInformation: true
                },
                includeCompanyObjectsInformation: true,
                includeGoodStandingInformation: true,
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: addressRecordsType
                },
                secretaryDetails: {
                    includeBasicInformation: true
                }
            } as CertificateItemOptions;
        };

        it("includeAddressRecordsType with a value of 'current' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("current");
            const result = otherCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("Current address");
        });

        it("includeAddressRecordsType with a value of 'current-and-previous' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("current-and-previous");
            const result = otherCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("Current address and the one previous");
        });

        it("includeAddressRecordsType with a value of 'current-previous-and-prior' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("current-previous-and-prior");
            const result = otherCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("Current address and the two previous");
        });

        it("includeAddressRecordsType with a value of 'all' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("all");
            const result = otherCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("All current and previous addresses");
        });

        it("includeAddressRecordsType with a value of undefined returns correct mapped text", () => {
            const itemOptions = {
                directorDetails: {
                    includeBasicInformation: true
                },
                includeCompanyObjectsInformation: true,
                includeGoodStandingInformation: true,
                registeredOfficeAddressDetails: {},
                secretaryDetails: {
                    includeBasicInformation: true
                }
            } as CertificateItemOptions;
            const result = otherCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("No");
        });
    });


    describe("determineDirectorOrSecretaryOptionsText", () => {
        it("directorDetails with just basic information", () => {
            const directorDetails = {
                includeBasicInformation: true
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal("Yes");
        });

        it("directorDetails with basic information plus correspondence address", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeAddress: true
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Correspondence address"]));
        });

        it("directorDetails with basic information plus appointment date", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeAppointmentDate: true
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Appointment date"]));
        });

        it("directorDetails with basic information plus country of residence", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeCountryOfResidence: true
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Country of residence"]));
        });

        it("directorDetails with basic information plus nationality", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeNationality: true
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Nationality"]));
        });

        it("directorDetails with basic information plus occupation", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeOccupation: true
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Occupation"]));
        });

        it("directorDetails with basic information plus date of birth", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeDobType: "partial"
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Date of birth (month and year)"]));
        });

        it("directorDetails include basic information is false", () => {
            const directorDetails = {
                includeBasicInformation: false
            };
            const result = otherCertificateItemMapper.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal("No");
        });
    });
});