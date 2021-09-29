import {ItemMapper} from "./ItemMapper";
import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {createLogger} from "ch-structured-logging";
import {APPLICATION_NAME} from "../config/config";
import {DesignatedMemberDetails, MemberDetails} from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import {DobType} from "../model/DobType";
import {MapUtil} from "./MapUtil";

const logger = createLogger(APPLICATION_NAME);

export class LLPCertificateItemMapper extends ItemMapper {

    getOrdersDetailTable(item: { companyName: string, companyNumber: string, itemOptions: CertificateItemOptions }): any {

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
                    text: "The names of all current designated members"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentDesignatedMembersNames'>" + this.mapDesignatedMembersOptions(item.itemOptions.designatedMemberDetails) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "current designated members names"
                        }
                    ]
                }
            },
            {
                key: {
                    text: "The names of all current members"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentMembersNames'>" + this.mapMembersOptions(item.itemOptions.memberDetails) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "current members names"
                        }
                    ]
                }
            }
        ];
    }

    mapRegisteredOfficeAddress = (itemOptions: CertificateItemOptions): string => {
        return MapUtil.mapAddressOptions(itemOptions?.registeredOfficeAddressDetails);
    }

    mapDesignatedMembersOptions = (designatedMembersOptions?: DesignatedMemberDetails): string => {
        if (designatedMembersOptions === undefined || designatedMembersOptions.includeBasicInformation === undefined) {
            return "No";
        }

        if (designatedMembersOptions.includeBasicInformation === true &&
            designatedMembersOptions.includeAddress === false &&
            designatedMembersOptions.includeAppointmentDate === false &&
            designatedMembersOptions.includeCountryOfResidence === false &&
            designatedMembersOptions.includeDobType === undefined) {
            return "Yes";
        }

        const designatedMembersMappings: string[] = [];
        designatedMembersMappings.push("Including designated members':");

        if (designatedMembersOptions.includeAddress) {
            designatedMembersMappings.push("Correspondence address");
        }

        if (designatedMembersOptions.includeAppointmentDate) {
            designatedMembersMappings.push("Appointment date");
        }

        if (designatedMembersOptions.includeCountryOfResidence) {
            designatedMembersMappings.push("Country of residence");
        }

        if (designatedMembersOptions.includeDobType === DobType.PARTIAL ||
            designatedMembersOptions.includeDobType === DobType.FULL) {
            designatedMembersMappings.push("Date of birth (month and year)");
        }

        return MapUtil.mapToHtml(designatedMembersMappings);
    };

    mapMembersOptions = (memberOptions?: MemberDetails): string => {
        if (memberOptions === undefined || memberOptions.includeBasicInformation === undefined) {
            return "No";
        }

        if (memberOptions.includeBasicInformation === true &&
            memberOptions.includeAddress === false &&
            memberOptions.includeAppointmentDate === false &&
            memberOptions.includeCountryOfResidence === false &&
            memberOptions.includeDobType === undefined) {
            return "Yes";
        }

        const membersMappings: string[] = [];
        membersMappings.push("Including members':");

        if (memberOptions.includeAddress) {
            membersMappings.push("Correspondence address");
        }

        if (memberOptions.includeAppointmentDate) {
            membersMappings.push("Appointment date");
        }

        if (memberOptions.includeCountryOfResidence) {
            membersMappings.push("Country of residence");
        }

        if (memberOptions.includeDobType === "partial" ||
            memberOptions.includeDobType === "full") {
            membersMappings.push("Date of birth (month and year)");
        }

        return MapUtil.mapToHtml(membersMappings);
    }
}