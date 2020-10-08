import { Basket, DeliveryDetails } from "api-sdk-node/dist/services/order/basket/types";
import { Order, Item, CertificateItemOptions, CertifiedCopyItemOptions, MissingImageDeliveryItemOptions } from "api-sdk-node/dist/services/order/order";
import { FilingHistoryDocuments } from "api-sdk-node/dist/services/order/certified-copies";

import { APPLICATION_NAME, SERVICE_NAME_CERTIFICATES, SERVICE_NAME_CERTIFIED_COPIES } from "../config/config";
import { mapFilingHistory } from "./filing.history.service";
import { mapFilingHistoryDate } from "../utils/date.util";

export interface CheckDetailsItem {
    serviceUrl?: string;
    serviceName?: string;
    titleText?: string;
    pageTitle?: string;
    happensNext?: string;
    filingHistoryDocuments?: any[];
    orderDetailsTable?: any[];
    documentDetailsTable?: number;
}

export const mapItem = (item: Item, deliveryDetails: DeliveryDetails| undefined): CheckDetailsItem => {
    const itemKind = item?.kind;
    if (itemKind === "item#certificate") {
        const deliveryMethod = mapDeliveryMethod(item?.itemOptions);
        const address = mapDeliveryDetails(deliveryDetails);

        const itemOptionsCertificate = item.itemOptions as CertificateItemOptions;
        const certificateDetails = {
            certificateType: mapCertificateType(itemOptionsCertificate.certificateType),
            includedOnCertificate: mapIncludedOnCertificate(item?.itemOptions)
        };
        const certificatesOrderDetails = [
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
                    text: "Included on certificate"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='includedOnCertificateValue'>" + certificateDetails.includedOnCertificate + "</p>"
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
            serviceUrl: `/company/${item?.companyNumber}/orderable/certificates`,
            serviceName: SERVICE_NAME_CERTIFICATES,
            titleText: "Certificate ordered",
            pageTitle: "Certificate ordered confirmation",
            happensNext: "We'll prepare the certificate and aim to dispatch it within 4 working days.",
            orderDetailsTable: certificatesOrderDetails
        };
    } else if (itemKind === "item#certified-copy") {
        const deliveryMethod = mapDeliveryMethod(item?.itemOptions);
        const address = mapDeliveryDetails(deliveryDetails);

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
            happensNext: "We'll prepare your order and aim to dispatch it within 4 working days.",
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
            orderDetailsTable: missingImageDeliveryOrderDetails,
            titleText: "Document Requested",
            pageTitle: "Document Requested",
            happensNext: `<p class="govuk-body">We will check if the document is available. This takes us up to 2 hours between 8.30am - 4pm, Monday - Friday (excluding holidays).</p>

            <p class="govuk-body">If your request has been made outside of this time, the document will be added the next working day.</p>
            
            <p class="govuk-body">Check the <a href="/company/${item.companyNumber}/filing-history" class="govuk-link govuk-link--no-visited-state">company’s filing history</a> for updates on the document's availablility.</p>
            
            <p class="govuk-body">If we cannot add the document to the filing history, we will contact you to issue a refund.</p>`
        };
    }
};

export const mapCertificateType = (cerificateType: string): string | null => {
    if (!cerificateType) {
        return null;
    }
    if (cerificateType === "incorporation-with-all-name-changes") {
        return "Incorporation with all company name changes";
    }
    const cleanedCertificateType = cerificateType.replace(/-/g, " ");
    return cleanedCertificateType.charAt(0).toUpperCase() + cleanedCertificateType.slice(1);
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
        const mappedFilingHistoryCost = addCurrency(filingHistoryDocument.filingHistoryCost);
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

export const addCurrency = (filingHistoryCost: string) => {
    return `£${filingHistoryCost}`;
};

export const mapDeliveryDetails = (deliveryDetails: DeliveryDetails | undefined): string => {
    const mappings:string[] = [];

    if (deliveryDetails === undefined) {
        return "";
    }

    mappings.push(deliveryDetails.forename + " " + deliveryDetails.surname);
    mappings.push(deliveryDetails.addressLine1);

    if (deliveryDetails.addressLine2 !== "" && deliveryDetails.addressLine2 !== undefined) {
        mappings.push(deliveryDetails.addressLine2);
    }

    mappings.push(deliveryDetails.locality);

    if (deliveryDetails.region !== "" && deliveryDetails.region !== undefined) {
        mappings.push(deliveryDetails.region);
    }

    if (deliveryDetails.postalCode !== "" && deliveryDetails.postalCode !== undefined) {
        mappings.push(deliveryDetails.postalCode);
    }

    mappings.push(deliveryDetails.country);

    return mapToHtml(mappings);
};

export const mapDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
    if (itemOptions?.deliveryTimescale === "standard") {
        return "Standard delivery (aim to dispatch within 4 working days)";
    }
    if (itemOptions?.deliveryTimescale === "same-day") {
        return "Same Day";
    }
    return null;
};

export const mapToHtml = (mappings: string[]): string => {
    let htmlString: string = "";

    mappings.forEach((element) => {
        htmlString += element + "<br>";
    });
    return htmlString;
};
