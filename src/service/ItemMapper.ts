import {DeliveryDetails} from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {DISPATCH_DAYS} from "../config/config";
import {MapUtil} from "./MapUtil";

export const SERVICE_NAME_CERTIFICATES = "Order a certificate";
const dispatchDays: string = DISPATCH_DAYS;

export interface CheckDetailsItem {
    serviceUrl?: string;
    serviceName?: string;
    titleText?: string;
    pageTitle?: string;
    happensNext?: string;
    filingHistoryDocuments?: any[];
    orderDetailsTable?: any[];
    documentDetailsTable?: number;
    certificateDetailsTable?: number;
    deliveryDetailsTable?: any[];
}

export abstract class ItemMapper {

    getCheckDetailsItem = (itemDetails: { companyName: string, companyNumber: string, itemOptions: CertificateItemOptions, deliveryDetails: DeliveryDetails | undefined }): CheckDetailsItem => {
        return {
            serviceUrl: `/company/${itemDetails?.companyNumber}/orderable/certificates`,
            serviceName: SERVICE_NAME_CERTIFICATES,
            titleText: "Certificate ordered",
            pageTitle: "Certificate ordered confirmation",
            happensNext: "We'll prepare the certificate and aim to dispatch it within " + dispatchDays + " working days.",
            orderDetailsTable: this.getOrdersDetailTable(itemDetails),
            certificateDetailsTable: 1,
            deliveryDetailsTable: this.getDeliveryDetailsTable(itemDetails)
        }
    }

    protected getDeliveryDetailsTable = (item: { itemOptions: CertificateItemOptions, deliveryDetails: DeliveryDetails | undefined }): any => {
        const address = ItemMapper.mapDeliveryDetails(item.deliveryDetails);
        const deliveryMethod = ItemMapper.mapDeliveryMethod(item?.itemOptions);

        let certificateDeliveryDetails = [
            {
                key: {
                    classes: "govuk-!-width-one-half",
                    text: "Delivery method"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='deliveryMethodValue'>" + deliveryMethod + "</p>"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-half",
                    text: "Delivery details"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='deliveryAddressValue'>" + address + "</p>"
                }
            }
        ]

        return certificateDeliveryDetails;
    }


    abstract getOrdersDetailTable(item: { companyName: string, companyNumber: string, itemOptions: CertificateItemOptions }): any;

    static mapDeliveryDetails = (deliveryDetails: DeliveryDetails | undefined): string => {
        const mappings: string[] = [];

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

        return MapUtil.mapToHtml(mappings);
    }

    static mapDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
        if (itemOptions?.deliveryTimescale === "standard") {
            return "Standard delivery (aim to dispatch within " + dispatchDays + " working days)";
        }
        if (itemOptions?.deliveryTimescale === "same-day") {
            return "Same Day";
        }
        return null;
    }

    static mapCertificateType = (certificateType: string): string | null => {
        if (!certificateType) {
            return null;
        }
        if (certificateType === "incorporation-with-all-name-changes") {
            return "Incorporation with all company name changes";
        }

        if (certificateType === "dissolution") {
            return "Dissolution with all company name changes";
        }

        const cleanedCertificateType = certificateType.replace(/-/g, " ");
        return cleanedCertificateType.charAt(0).toUpperCase() + cleanedCertificateType.slice(1);
    }
}