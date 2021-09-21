import {ItemMapper} from "./ItemMapper";
import {
    CertificateItemOptions,
    DirectorOrSecretaryDetails
} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {createLogger} from "ch-structured-logging";
import {APPLICATION_NAME} from "../config/config";
import {MapUtil} from "./MapUtil";

const logger = createLogger(APPLICATION_NAME);

export class OtherCertificateItemMapper extends ItemMapper {

    getOrdersDetailTable(item: {companyName: string,  companyNumber: string, itemOptions: CertificateItemOptions}): any {
        return [
            {
                key: {
                    text: "Company name",
                    classes: "govuk-!-width-one-half"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='companyNameValue'>" + item.companyName + "</p>"
                }
            },
            {
                key: {
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='companyNumberValue'>" + item.companyNumber + "</p>"
                }
            },
            {
                key: {
                    text: "Certificate type",
                    classes: "govuk-!-width-one-half"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='certificateTypeValue'>" + this.mapCertificateType(item.itemOptions.certificateType) + "</p>"
                }
            },
            {
                key: {
                    text: "Statement of good standing"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='statementOfGoodStandingValue'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.includeGoodStandingInformation) + "</p>"
                }
            },
            {
                key: {
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='registeredOfficeAddress'>" + this.mapRegisteredOfficeAddress(item.itemOptions) + "</p>"
                }
            },
            {
                key: {
                    text: "The names of all current company directors"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentCompanyDirectors'>" + this.determineDirectorOrSecretaryOptionsText(item.itemOptions.directorDetails, "directors") + "</p>"
                }
            },
            {
                key: {
                    text: "The names of all current company secretaries"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentCompanySecretaries'>" + this.determineDirectorOrSecretaryOptionsText(item.itemOptions.secretaryDetails, "secretaries") + "</p>"
                }
            },
            {
                key: {
                    text: "Company objects"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='companyObjects'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.includeCompanyObjectsInformation) + "</p>"
                }
            }
        ]
    }

    mapRegisteredOfficeAddress = (itemOptions: CertificateItemOptions): string => {
        return MapUtil.mapAddressOptions(itemOptions?.registeredOfficeAddressDetails);
    }

    determineDirectorOrSecretaryOptionsText = (directorOrSecretaryDetails: DirectorOrSecretaryDetails, officer: string) => {
        if (directorOrSecretaryDetails === undefined || !directorOrSecretaryDetails.includeBasicInformation) {
            return "No";
        }
        const directorOrSecretaryOptions: string[] = [];

        if (directorOrSecretaryDetails.includeAddress) {
            directorOrSecretaryOptions.push("Correspondence address");
        }
        if (directorOrSecretaryDetails.includeOccupation) {
            directorOrSecretaryOptions.push("Occupation");
        }
        if (directorOrSecretaryDetails.includeDobType === "partial") {
            directorOrSecretaryOptions.push("Date of birth (month and year)");
        }
        if (directorOrSecretaryDetails.includeAppointmentDate) {
            directorOrSecretaryOptions.push("Appointment date");
        }
        if (directorOrSecretaryDetails.includeNationality) {
            directorOrSecretaryOptions.push("Nationality");
        }
        if (directorOrSecretaryDetails.includeCountryOfResidence) {
            directorOrSecretaryOptions.push("Country of residence");
        }
        if (directorOrSecretaryOptions.length > 0) {
            directorOrSecretaryOptions.unshift("Including " + officer + "':", "");
        } else {
            return "Yes";
        }
        return MapUtil.mapToHtml(directorOrSecretaryOptions);
    }
}
