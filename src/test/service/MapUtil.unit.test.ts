import {MapUtil} from "../../service/MapUtil";
import {expect} from "chai";
import { CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { DISPATCH_DAYS } from "../../config/config";
import {AddressRecordsType} from "../../model/AddressRecordsType";
import { DobType } from "../../model/DobType";

describe("MapUtil unit tests", () => {
    describe("determineItemOptionsSelectedText", () => {
        it("item option defined returns Yes", () => {
            const result = MapUtil.determineItemOptionsSelectedText(true);
            expect(result).to.equal("Yes");
        });

        it("item option undefined returns No", () => {
            const result = MapUtil.determineItemOptionsSelectedText(undefined);
            expect(result).to.equal("No");
        });

        it('should correctly map to HTML', function () {
            // Given
            const elements = ["This is a test of inserting line breaks", "This is a new line1", "This is a new line2"];

            // When
            const result = MapUtil.mapToHtml(elements);

            // Then
            expect(result).to.equal("This is a test of inserting line breaks<br>This is a new line1<br>This is a new line2<br>")
        });

        it('should correctly escape some HTML special characters', function () {
            // Given
            const elements = ["This is a test for escaping special characters e.g. & and < and >"];

            // When
            const result = MapUtil.mapToHtml(elements);

            // Then
            expect(result).to.equal("This is a test for escaping special characters e.g. &amp; and &lt; and &gt;<br>")
        });
    });

    describe("mapCertificateType", () => {
        it("maps incorporation-with-all-name-changes to Incorporation with all company name changes", () => {
            const result = MapUtil.mapCertificateType("incorporation-with-all-name-changes");
            expect(result).to.equal("Incorporation with all company name changes");
        });

        it("maps dissolution to Dissolution with all company name changes", () => {
            const result = MapUtil.mapCertificateType("dissolution");
            expect(result).to.equal("Dissolution with all company name changes");
        });
    });

    describe("mapAddress", () => {
        it("maps full delivery details correctly", () => {
            const deliveryDetails = {
                addressLine1: "address line 1",
                addressLine2: "address line 2",
                country: "country",
                forename: "forename",
                locality: "locality",
                postalCode: "postal code",
                region: "region",
                surname: "surname",
                poBox: "po box"
            };
            const result = MapUtil.mapDeliveryDetails(deliveryDetails);
            expect(result).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "address line 2", "locality", "region", "postal code", "country"]));
        });

        it("maps full delivery details correctly", () => {
            const deliveryDetails = {
                addressLine1: "address line 1",
                forename: "forename",
                postalCode: "postal code",
                region: "region",
                surname: "surname",
                country: "country",
                locality: "locality"
            };
            const result = MapUtil.mapDeliveryDetails(deliveryDetails);
            expect(result).to.equal(MapUtil.mapToHtml(["forename surname", "address line 1", "locality", "region", "postal code", "country"]));
        });
    });

    describe("mapDeliveryMethod", () => {
        it("map standard to Standard delivery (dispatched within the 'dispatch date config value' working days)", () => {
            const result = MapUtil.mapDeliveryMethod({deliveryTimescale: "standard"} as CertificateItemOptions);
            expect(result).to.equal("Standard delivery (aim to dispatch within " + DISPATCH_DAYS + " working days)");
        });

        it("maps same-day to Same Day", () => {
            const result = MapUtil.mapDeliveryMethod({deliveryTimescale: "same-day"} as CertificateItemOptions);
            expect(result).to.equal("Same Day");
        });
    });

    describe("addressMapping unit tests", () => {
        it("correctly handles the case where registeredOfficeAddressDetails are undefined", () => {
            const result = MapUtil.mapAddressOptions(undefined);
            expect(result).to.equal("No");
        });

        it("correctly handles the case where registeredOfficeAddressDetails is defined but includeAddressRecordsType is undefined", () => {
            const result = MapUtil.mapAddressOptions({});
            expect(result).to.equal("No");
        });

        it("correctly handles the case where registeredOfficeAddressDetails is defined but includeAddressRecordsType is defined but set to undefine", () => {
            const result = MapUtil.mapAddressOptions({includeAddressRecordsType: undefined});
            expect(result).to.equal("No");
        });

        it("correctly handles the case where registeredOfficeAddressDetails is defined but includeAddressRecordsType current", () => {
            const result = MapUtil.mapAddressOptions({includeAddressRecordsType: AddressRecordsType.CURRENT});
            expect(result).to.equal("Current address");
        });

        it("correctly handles the case where registeredOfficeAddressDetails is defined but includeAddressRecordsType current and previous", () => {
            const result = MapUtil.mapAddressOptions({includeAddressRecordsType: AddressRecordsType.CURRENT_AND_PREVIOUS});
            expect(result).to.equal("Current address and the one previous");
        });

        it("correctly handles the case where registeredOfficeAddressDetails is defined but includeAddressRecordsType current previous and prior", () => {
            const result = MapUtil.mapAddressOptions({includeAddressRecordsType: AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR});
            expect(result).to.equal("Current address and the two previous");
        });

        it("correctly handles the case where registeredOfficeAddressDetails is defined but includeAddressRecordsType ALL", () => {
            const result = MapUtil.mapAddressOptions({includeAddressRecordsType: AddressRecordsType.ALL});
            expect(result).to.equal("All current and previous addresses");
        });
    });

    describe("determineDirectorOrSecretaryOptionsText", () => {
        it("directorDetails with just basic information", () => {
            const directorDetails = {
                includeBasicInformation: true
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal("Yes");
        });

        it("directorDetails with basic information plus correspondence address", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeAddress: true
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Correspondence address"]));
        });

        it("directorDetails with basic information plus appointment date", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeAppointmentDate: true
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Appointment date"]));
        });

        it("directorDetails with basic information plus country of residence", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeCountryOfResidence: true
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Country of residence"]));
        });

        it("directorDetails with basic information plus nationality", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeNationality: true
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Nationality"]));
        });

        it("directorDetails with basic information plus occupation", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeOccupation: true
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Occupation"]));
        });

        it("directorDetails with basic information plus date of birth", () => {
            const directorDetails = {
                includeBasicInformation: true,
                includeDobType: "partial"
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal(MapUtil.mapToHtml(["Including directors':", "", "Date of birth (month and year)"]));
        });

        it("directorDetails include basic information is false", () => {
            const directorDetails = {
                includeBasicInformation: false
            };
            const result = MapUtil.determineDirectorOrSecretaryOptionsText(directorDetails, "directors");
            expect(result).to.equal("No");
        });
    });

    describe("Map members options", () => {
        it("should correctly map members options when undefined", () => {
            // Given
            const itemOptions = {
                memberDetails: {}
            } as CertificateItemOptions;

            // When
            const result = MapUtil.mapMembersOptions("Including members':", itemOptions.memberDetails);

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
            const result = MapUtil.mapMembersOptions("Including members':", itemOptions.memberDetails);

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
            const result = MapUtil.mapMembersOptions("Including members':", itemOptions.memberDetails);

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
            const result = MapUtil.mapMembersOptions("Including members':", itemOptions.memberDetails);

            // Then
            expect(result).to.equal(MapUtil.mapToHtml(["Including members':", "", "Correspondence address", "Appointment date", "Country of residence", "Date of birth (month and year)"]));
        });
    });

    describe("mapEmailRequired", () => {
        let itemOptions = {
            deliveryTimescale: "standard",
            includeEmailCopy: false
        } as CertificateItemOptions;

        it("map standard delivery timescale to show email only available for same day delivery", () => {
            const result = MapUtil.mapEmailCopyRequired(itemOptions);
            expect(result).to.equal("Email only available for express delivery method");
        });
        it("map same day delivery timescale with email required to display yes", () => {
            itemOptions.deliveryTimescale = "same-day";
            itemOptions.includeEmailCopy = true;
            const result = MapUtil.mapEmailCopyRequired(itemOptions);
            expect(result).to.equal("Yes");
        });
        it("map same day delivery timescale with np email required to display no", () => {
            itemOptions.deliveryTimescale = "same-day";
            itemOptions.includeEmailCopy = false;
            const result = MapUtil.mapEmailCopyRequired(itemOptions);
            expect(result).to.equal("No");
        });
    });
});
