import { ItemMapper } from "./ItemMapper";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { MapUtil } from "./MapUtil";

export class LPCertificateItemMapper extends ItemMapper {

    getOrdersDetailTable (item: { companyName: string, companyNumber: string, itemOptions: CertificateItemOptions }): any {
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
                    text: "Principal place of business"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='principalPlaceOfBusiness'>" + MapUtil.mapAddressOptions(item.itemOptions?.principalPlaceOfBusinessDetails) + "</p>"
                }
            },
            {
                key: {
                    text: "The names of all current general partners"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='generalPartners'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.generalPartnerDetails?.includeBasicInformation) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "current general partners names"
                        }
                    ]
                }
            },
            {
                key: {
                    text: "The names of all current limited partners"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='limitedPartners'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.limitedPartnerDetails?.includeBasicInformation) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "current limited partners names"
                        }
                    ]
                }
            },
            {
                key: {
                    text: "General nature of business"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='generalNatureOfBusiness'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.includeGeneralNatureOfBusinessInformation) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "general nature of business"
                        }
                    ]
                }
            }
        ];
    }
}
