import {ItemMapper} from "./ItemMapper";
import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {MapUtil} from "./MapUtil";

export class LiquidatedLLPCertificateItemMapper extends ItemMapper {

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
                }
            },
            {
                key: {
                    text: "The names of all current members"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentMembersNames'>" + MapUtil.mapMembersOptions("Including members':", item.itemOptions.memberDetails) + "</p>"
                }
            },
            {
                key: {
                    text: "Liquidators' details"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='liquidators'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.liquidatorsDetails?.includeBasicInformation) + "</p>"
                }
            }
        ];
    }
}
