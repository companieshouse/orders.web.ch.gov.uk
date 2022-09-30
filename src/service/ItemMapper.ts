import {DeliveryDetails} from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {ItemOptions as CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {DISPATCH_DAYS} from "../config/config";
import {MapUtil} from "./MapUtil";

export const SERVICE_NAME_CERTIFICATES = "Order a certificate";
const dispatchDays: string = DISPATCH_DAYS;
const SAME_DAY_HAPPENS_NEXT_TEXT = "Express orders received before 11am will be sent out the same working day. Orders received after 11am will be sent out the next working day. We send UK orders by Royal Mail 1st Class post and international orders by Royal Mail International post.";
const DEFAULT_TEXT = "We aim to send out standard orders within " + dispatchDays + " working days. We send UK orders by Royal Mail 2nd Class post and international orders by Royal Mail International Standard post.";

export interface CheckDetailsItem {
    serviceUrl?: string;
    serviceName?: string;
    titleText?: string;
    pageTitle?: string;
    whatHappensNextText?: string;
    filingHistoryDocuments?: any[];
    orderDetailsTable?: any[];
    documentDetailsTable?: number;
    certificateDetailsTable?: number;
    deliveryDetailsTable?: any[];
}

export abstract class ItemMapper {

    getCheckDetailsItem = (itemDetails: { companyName: string, companyNumber: string, itemOptions: CertificateItemOptions, deliveryDetails: DeliveryDetails | undefined }): CheckDetailsItem => {
       const whatHappensNextText = itemDetails.itemOptions?.deliveryTimescale === "same-day" ? SAME_DAY_HAPPENS_NEXT_TEXT : DEFAULT_TEXT

            return {
                serviceUrl: `/company/${itemDetails?.companyNumber}/orderable/certificates`,
                serviceName: SERVICE_NAME_CERTIFICATES,
                titleText: "Certificate ordered",
                pageTitle: "Certificate ordered confirmation",
                whatHappensNextText: whatHappensNextText,
                orderDetailsTable: this.getOrdersDetailTable(itemDetails),
                certificateDetailsTable: 1,
                deliveryDetailsTable: this.getDeliveryDetailsTable(itemDetails)
            }
    }

    protected getDeliveryDetailsTable = (item: { itemOptions: CertificateItemOptions, deliveryDetails: DeliveryDetails | undefined }): any => {
        const address = this.mapDeliveryDetails(item.deliveryDetails);
        const deliveryMethod = this.mapDeliveryMethod(item?.itemOptions);
        const emailCopyRequired = this.mapEmailCopyRequired(item?.itemOptions);

        const  certificateDeliveryDetails = [
            {
                key: {
                    classes: "govuk-!-width-one-half",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='deliveryMethodValue'>" + deliveryMethod + "</p>"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-half",
                    text: "Email copy required"
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
    };

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
