import {DeliveryDetails} from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/checkout";
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
       const SAME_DAY_HAPPENS_NEXT_TEXT = "We'll prepare the certificate and orders received before 11am will be dispatched the same day. Orders received after 11am will be dispatched the next working day.";
       const DEFAULT_TEXT = "We'll prepare the certificate and aim to dispatch it within " + dispatchDays + " working days.";
       
        const whatHappensNextText = itemDetails.itemOptions?.deliveryTimescale === "same-day" ? SAME_DAY_HAPPENS_NEXT_TEXT : DEFAULT_TEXT
        
            return {
                serviceUrl: `/company/${itemDetails?.companyNumber}/orderable/certificates`,
                serviceName: SERVICE_NAME_CERTIFICATES,
                titleText: "Certificate ordered",
                pageTitle: "Certificate ordered confirmation",
                happensNext: whatHappensNextText,
                orderDetailsTable: this.getOrdersDetailTable(itemDetails),
                certificateDetailsTable: 1,
                deliveryDetailsTable: this.getDeliveryDetailsTable(itemDetails)
            }
    }

    protected getDeliveryDetailsTable = (item: { itemOptions: CertificateItemOptions, deliveryDetails: DeliveryDetails | undefined }): any => {
        const address = this.mapDeliveryDetails(item.deliveryDetails);
        const deliveryMethod = this.mapDeliveryMethod(item?.itemOptions);
        const emailCopyRequired = this.mapEmailCopyRequired(item?.itemOptions);


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
                    text: "Email Copy Required"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='emailCopyRequiredValue'>" + emailCopyRequired + "</p>"
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

    mapDeliveryDetails = (deliveryDetails: DeliveryDetails | undefined): string => {
        return MapUtil.mapDeliveryDetails(deliveryDetails);
    }

    mapDeliveryMethod = (itemOptions: CertificateItemOptions): string | null => {
        return MapUtil.mapDeliveryMethod(itemOptions);
    }

    mapEmailCopyRequired = (itemOptions: CertificateItemOptions): string | null => {
        return MapUtil.mapEmailCopyRequired(itemOptions);
    }

    mapCertificateType = (certificateType: string): string | null => {
        return MapUtil.mapCertificateType(certificateType);
    }
}