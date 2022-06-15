import {ItemMapper} from "./ItemMapper";
import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {MapUtil} from "./MapUtil";

export class AdministratedLLPCertificateItemMapper extends ItemMapper {

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
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='registeredOfficeAddress'>" + MapUtil.mapAddressOptions(item.itemOptions?.registeredOfficeAddressDetails) + "</p>"
                }
            },
            {
                key: {
                    text: "The names of all current designated members"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentDesignatedMembersNames'>" + MapUtil.mapMembersOptions("Including designated members':", item.itemOptions.designatedMemberDetails) + "</p>"
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
                    html: "<p id='currentMembersNames'>" + MapUtil.mapMembersOptions("Including members':", item.itemOptions.memberDetails) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "current members names"
                        }
                    ]
                }
            },
            {
                key: {
                    text: "Administrators' details"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='administrators'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.administratorsDetails?.includeBasicInformation) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "administrators' details"
                        }
                    ]
                }
            }
        ];
    }
}