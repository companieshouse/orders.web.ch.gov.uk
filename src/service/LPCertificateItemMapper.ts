import {ItemMapper} from "./ItemMapper";
import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {createLogger} from "ch-structured-logging";
import {APPLICATION_NAME} from "../config/config";
import {MapUtil} from "./MapUtil";

const logger = createLogger(APPLICATION_NAME);

export class LPCertificateItemMapper extends ItemMapper {

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
                    html: "<p id='certificateTypeValue'>" + ItemMapper.mapCertificateType(item.itemOptions.certificateType) + "</p>"
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
                    html: "<p id='registeredOfficeAddress'>" + this.mapPrincipalPlaceOfBusiness(item.itemOptions) + "</p>"
                }
            },
            {
                key: {
                    text: "General Partners"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='generalPartners'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.generalPartnerDetails?.includeBasicInformation) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "general partners"
                        }
                    ]
                }
            },
            {
                key: {
                    text: "Limited Partners"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='limitedPartners'>" + MapUtil.determineItemOptionsSelectedText(item.itemOptions.limitedPartnerDetails?.includeBasicInformation) + "</p>"
                },
                actions: {
                    items: [
                        {
                            visuallyHiddenText: "limited partners"
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

    mapPrincipalPlaceOfBusiness = (itemOptions: CertificateItemOptions): string => {
        const optionSelected: string | undefined =
            itemOptions?.principalPlaceOfBusinessDetails?.includeAddressRecordsType;

        switch (optionSelected) {
            case "current":
                return "Current address";

            case "current-and-previous":
                return "Current address and the one previous";

            case "current-previous-and-prior":
                return "Current address and the two previous";

            case "all":
                return "All current and previous addresses";

            case undefined:
                return "No";

            default:
                logger.error(`Unable to map value for principal place of business options: ${optionSelected}`);
                return "";
        }
    }
}