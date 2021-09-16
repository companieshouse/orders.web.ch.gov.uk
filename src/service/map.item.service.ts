import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { Item, CertificateItemOptions, CertifiedCopyItemOptions, MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { FilingHistoryDocuments } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";

import { SERVICE_NAME_CERTIFICATES, SERVICE_NAME_CERTIFIED_COPIES, SERVICE_NAME_MISSING_IMAGE_DELIVERIES, APPLICATION_NAME, DISPATCH_DAYS } from "../config/config";
import { mapFilingHistory } from "./filing.history.service";
import { mapFilingHistoryDate } from "../utils/date.util";
import {ItemMapperFactory} from "./ItemMapperFactory";
import {MapUtil} from "./MapUtil";
import {CheckDetailsItem, ItemMapper} from "./ItemMapper";

const dispatchDays: string = DISPATCH_DAYS;

export const mapItem = (item: Item, deliveryDetails: DeliveryDetails | undefined): CheckDetailsItem => {
    const itemKind = item?.kind;
    if (itemKind === "item#certificate") {
        const itemOptions = item.itemOptions as CertificateItemOptions;
        if (itemOptions.certificateType === "incorporation-with-all-name-changes") {
            return new ItemMapperFactory().getItemMapper(itemOptions.companyType).getCheckDetailsItem({companyName: item?.companyName, companyNumber: item?.companyNumber, itemOptions, deliveryDetails});
        } else {
            const deliveryMethod = ItemMapper.mapDeliveryMethod(item?.itemOptions);
            const address = ItemMapper.mapDeliveryDetails(deliveryDetails);
            const certificateDetails = {
                certificateType: ItemMapper.mapCertificateType(itemOptions.certificateType)
            };
            const dissolvedCertificatesOrderDetails = [
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
                        html: "<p id='certificateTypeValue'>" + certificateDetails.certificateType + "</p>"
                    }
                },
                {
                    key: {
                        text: "Delivery method"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='deliveryMethodValue'>" + deliveryMethod + "</p>"
                    }
                },
                {
                    key: {
                        text: "Delivery details"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='deliveryAddressValue'>" + address + "</p>"
                    }
                }
            ];
            return {
                serviceUrl: `/company/${item?.companyNumber}/orderable/dissolved-certificates`,
                serviceName: SERVICE_NAME_CERTIFICATES,
                titleText: "Certificate ordered",
                pageTitle: "Certificate ordered confirmation",
                happensNext: "We'll prepare the certificate and aim to dispatch it within " + dispatchDays + " working days.",
                orderDetailsTable: dissolvedCertificatesOrderDetails
            };
        }
    } else if (itemKind === "item#certified-copy") {
        const deliveryMethod = ItemMapper.mapDeliveryMethod(item?.itemOptions);
        const address = ItemMapper.mapDeliveryDetails(deliveryDetails);

        const itemOptionsCertifiedCopy = item.itemOptions as CertifiedCopyItemOptions;
        const certifiedCopiesOrderDetails = [
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
                    text: "Delivery method"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='deliveryMethodValue'>" + deliveryMethod + "</p>"
                }
            },
            {
                key: {
                    text: "Delivery details"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='deliveryAddressValue'>" + address + "</p>"
                }
            }
        ];
        return {
            serviceUrl: `/company/${item?.companyNumber}/orderable/certified-copies`,
            serviceName: SERVICE_NAME_CERTIFIED_COPIES,
            titleText: "Certified document order confirmed",
            pageTitle: "Certified document order confirmation",
            happensNext: "We'll prepare your order and aim to dispatch it within " + dispatchDays + " working days.",
            orderDetailsTable: certifiedCopiesOrderDetails,
            filingHistoryDocuments: mapFilingHistoriesDocuments(itemOptionsCertifiedCopy.filingHistoryDocuments),
            documentDetailsTable: 1
        };
    } else {
        const itemOptionsMissingImageDelivery = item.itemOptions as MissingImageDeliveryItemOptions;
        const filingHistoryDescription = mapFilingHistory(itemOptionsMissingImageDelivery.filingHistoryDescription,
            itemOptionsMissingImageDelivery.filingHistoryDescriptionValues);

        const missingImageDeliveryOrderDetails = [
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
                    text: "Date"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='filingHistoryDateValue'>" + mapFilingHistoryDate(itemOptionsMissingImageDelivery.filingHistoryDate) + "</p>"
                }
            },
            {
                key: {
                    text: "Type"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='filingHistoryTypeValue'>" + itemOptionsMissingImageDelivery.filingHistoryType + "</p>"
                }
            },
            {
                key: {
                    text: "Description"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='filingHistoryDescriptionValue'>" + filingHistoryDescription + "</p>"
                }
            }
        ];
        return {
            serviceUrl: `/company/${item?.companyNumber}/filing-history`,
            serviceName: SERVICE_NAME_MISSING_IMAGE_DELIVERIES,
            orderDetailsTable: missingImageDeliveryOrderDetails,
            titleText: "Document Requested",
            pageTitle: "Document Requested",
            happensNext: `<p class="govuk-body">It can take us several hours to check the availability of a document. We will aim to add it to the <a href="/company/${item.companyNumber}/filing-history" class="govuk-link govuk-link--no-visited-state">company’s filing history </a>
            that day if the request is received between 8:30am and 3pm, Monday to Friday (excluding bank holidays).</p>

            <p class="govuk-body">If you make the request after 3pm, we will add the document the next working day.</p>
            
            <p class="govuk-body">If we cannot add the document to the filing history, we will contact you to issue a refund.</p>`
        };
    }
};

export const mapIncludedOnCertificate = (itemOptions: Record<string, any>): string | null => {
    const includedOnCertificate: string[] = [];
    if (itemOptions?.includeGoodStandingInformation === true) {
        includedOnCertificate.push("Statement of good standing");
    }
    if (itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType !== undefined &&
        itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType?.length !== 0) {
        includedOnCertificate.push("Registered office address");
    }
    if (itemOptions?.directorDetails?.includeBasicInformation === true) {
        includedOnCertificate.push("Directors");
    }
    if (itemOptions?.secretaryDetails?.includeBasicInformation === true) {
        includedOnCertificate.push("Secretaries");
    }
    if (itemOptions?.includeCompanyObjectsInformation === true) {
        includedOnCertificate.push("Company objects");
    }
    return includedOnCertificate.length === 0 ? "" : includedOnCertificate.reduce((accum, value) => accum + "<br/>" + value);
};

export const mapFilingHistoriesDocuments = (filingHistoryDocuments: FilingHistoryDocuments[]) => {
    const mappedFilingHistories = filingHistoryDocuments.map(filingHistoryDocument => {
        const mappedFilingHistoryDescription = mapFilingHistory(filingHistoryDocument.filingHistoryDescription, filingHistoryDocument.filingHistoryDescriptionValues || {});
        const mappedFilingHistoryDescriptionDate = mapFilingHistoryDate(filingHistoryDocument.filingHistoryDate);
        const mappedFilingHistoryCost = MapUtil.addCurrency(filingHistoryDocument.filingHistoryCost);
        return {
            filingHistoryDate: mappedFilingHistoryDescriptionDate,
            filingHistoryDescription: mappedFilingHistoryDescription,
            filingHistoryId: filingHistoryDocument.filingHistoryId,
            filingHistoryType: filingHistoryDocument.filingHistoryType,
            filingHistoryCost: mappedFilingHistoryCost
        };
    });
    return mappedFilingHistories;
};

