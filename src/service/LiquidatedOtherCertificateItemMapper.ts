import {ItemMapper} from "./ItemMapper";
import {ItemOptions as CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {MapUtil} from "./MapUtil";

export class LiquidatedOtherCertificateItemMapper extends ItemMapper {

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
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='registeredOfficeAddress'>" + MapUtil.mapAddressOptions(item.itemOptions?.registeredOfficeAddressDetails) + "</p>"
                }
            },
            {
                key: {
                    text: "The names of all current company directors"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentCompanyDirectors'>" + MapUtil.determineDirectorOrSecretaryOptionsText(item.itemOptions.directorDetails, "directors") + "</p>"
                }
            },
            {
                key: {
                    text: "The names of all current company secretaries"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='currentCompanySecretaries'>" + MapUtil.determineDirectorOrSecretaryOptionsText(item.itemOptions.secretaryDetails, "secretaries") + "</p>"
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
            },
            {
                key: {
                    text: "Liquidators' details"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='liquidators'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.liquidatorsDetails?.includeBasicInformation) + "</p>"
                }
            },
        ]
    }
}
