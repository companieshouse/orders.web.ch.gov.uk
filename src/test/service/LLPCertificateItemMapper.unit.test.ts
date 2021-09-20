import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {expect} from "chai";
import {LLPCertificateItemMapper} from "../../service/LLPCertificateItemMapper";
import {DobType} from "../../model/DobType";
import {MapUtil} from "../../service/MapUtil";

describe("LLPCertificateItemMapper unit tests", () => {

    const llpCertificateItemMapper: LLPCertificateItemMapper = new LLPCertificateItemMapper;

    describe("mapRegisteredOfficeAddress", () => {
        const itemOptionsRegOfficeAddress = (addressRecordsType: string): CertificateItemOptions => {
            return {
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: addressRecordsType
                }
            } as CertificateItemOptions;
        };

        it("includeAddressRecordsType with a value of 'current' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("current");
            const result = llpCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("Current address");
        });

        it("includeAddressRecordsType with a value of 'current-and-previous' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("current-and-previous");
            const result = llpCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("Current address and the one previous");
        });

        it("includeAddressRecordsType with a value of 'current-previous-and-prior' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("current-previous-and-prior");
            const result = llpCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("Current address and the two previous");
        });

        it("includeAddressRecordsType with a value of 'all' returns correct mapped text", () => {
            const itemOptions = itemOptionsRegOfficeAddress("all");
            const result = llpCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("All current and previous addresses");
        });

        it("includeAddressRecordsType with a value of undefined returns correct mapped text", () => {
            const itemOptions = {
                registeredOfficeAddressDetails: {}
            } as CertificateItemOptions;
            const result = llpCertificateItemMapper.mapRegisteredOfficeAddress(itemOptions);
            expect(result).to.equal("No");
        });
    });

    describe("Map designated members options", () => {
        it("should correctly map designated members options when undefined", () => {
            // Given
            const itemOptions = {
                designatedMemberDetails: {}
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapDesignatedMembersOptions(itemOptions.designatedMemberDetails);

            // Then
            expect(result).to.equal("No");
        });

        it("should correctly map designated members options when includeBasicInformation undefined", () => {
            // Given
            const itemOptions = {
                designatedMemberDetails: {
                    includeBasicInformation: undefined
                }
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapDesignatedMembersOptions(itemOptions.designatedMemberDetails);

            // Then
            expect(result).to.equal("No");
        });

        it("should correctly map designated members options when includeBasicInformation is true and all other options are false", () => {
            // Given
            const itemOptions = {
                designatedMemberDetails: {
                    includeAddress: false,
                    includeAppointmentDate: false,
                    includeBasicInformation: true,
                    includeCountryOfResidence: false,
                    includeDobType: undefined
                }
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapDesignatedMembersOptions(itemOptions.designatedMemberDetails);

            // Then
            expect(result).to.equal("Yes");
        });

        it("should correctly map designated members options when all options are true", () => {
            // Given
            const itemOptions = {
                designatedMemberDetails: {
                    includeAddress: true,
                    includeAppointmentDate: true,
                    includeBasicInformation: true,
                    includeCountryOfResidence: true,
                    includeDobType: DobType.PARTIAL
                }
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapDesignatedMembersOptions(itemOptions.designatedMemberDetails);

            // Then
            expect(result).to.equal(MapUtil.mapToHtml(["Including designated members':", "Correspondence address", "Appointment date", "Country of residence", "Date of birth (month and year)"]));
        });
    });

    describe("Map members options", () => {
        it("should correctly map members options when undefined", () => {
            // Given
            const itemOptions = {
                memberDetails: {}
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapMembersOptions(itemOptions.memberDetails);

            // Then
            expect(result).to.equal("No");
        });

        it("should correctly map members options when includeBasicInformation undefined", () => {
            // Given
            const itemOptions = {
                memberDetails: {
                    includeBasicInformation: undefined
                }
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapMembersOptions(itemOptions.memberDetails);

            // Then
            expect(result).to.equal("No");
        });

        it("should correctly map members options when includeBasicInformation is true and all other options are false", () => {
            // Given
            const itemOptions = {
                memberDetails: {
                    includeAddress: false,
                    includeAppointmentDate: false,
                    includeBasicInformation: true,
                    includeCountryOfResidence: false,
                    includeDobType: undefined
                }
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapMembersOptions(itemOptions.memberDetails);

            // Then
            expect(result).to.equal("Yes");
        });

        it("should correctly map members options when all options are true", () => {
            // Given
            const itemOptions = {
                memberDetails: {
                    includeAddress: true,
                    includeAppointmentDate: true,
                    includeBasicInformation: true,
                    includeCountryOfResidence: true,
                    includeDobType: DobType.PARTIAL
                }
            } as CertificateItemOptions;

            // When
            const result = llpCertificateItemMapper.mapMembersOptions(itemOptions.memberDetails);

            // Then
            expect(result).to.equal(MapUtil.mapToHtml(["Including members':", "Correspondence address", "Appointment date", "Country of residence", "Date of birth (month and year)"]));
        });
    });
});