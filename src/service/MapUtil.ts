import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    DirectorOrSecretaryDetails,
    MemberDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { AddressRecordsType } from "model/AddressRecordsType";
import { APPLICATION_NAME, DISPATCH_DAYS } from "../config/config";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { mapDate } from "../utils/date.util";
import { OrderDetails, PaymentDetails } from "../controllers/ConfirmationTemplateMapper";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment/types";

const escape = require("escape-html");
const logger = createLogger(APPLICATION_NAME);

export abstract class MapUtil {
    static mapToHtml = (elements: string[]): string => {
        let htmlString: string = "";

        elements.forEach((element) => {
            htmlString += escape(element) + "<br>";
        });
        return htmlString;
    }

    static determineItemOptionsSelectedText = (itemOption: any): string => {
        return (itemOption === undefined) ? "No" : "Yes";
    }

    static addCurrency = (filingHistoryCost: string) => {
        return `£${filingHistoryCost}`;
    };

    static mapDeliveryDetails = (deliveryDetails: DeliveryDetails | undefined): string => {
        const mappings: string[] = [];

        if (deliveryDetails === undefined) {
            return "";
        }

        mappings.push(deliveryDetails.forename + " " + deliveryDetails.surname);

        if (deliveryDetails.companyName !== "" && deliveryDetails.companyName !== undefined) {
            mappings.push(deliveryDetails.companyName);
        };

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

        return this.mapToHtml(mappings);
    }

    static mapDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
        if (itemOptions?.deliveryTimescale === "standard") {
            return "Standard (aim to send out within " + DISPATCH_DAYS + " working days)";
        }
        if (itemOptions?.deliveryTimescale === "same-day") {
            return "Express (Orders received before 11am will be sent out the same day. Orders received after 11am will be sent out the next working day)";
        }
        return null;
    }

    static mapBasketDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
        if (itemOptions?.deliveryTimescale === "standard") {
            return "Standard";
        }
        if (itemOptions?.deliveryTimescale === "same-day") {
            return "Express";
        }
        return null;
    }

    static mapEmailCopyRequired = (itemOptions: CertificateItemOptions): string => {
        if (itemOptions?.deliveryTimescale === "same-day") {
            if (itemOptions?.includeEmailCopy === true) {
                return "Yes";
            } else {
                return "No";
            }
        } else {
            return "Email only available for express dispatch";
        }
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

    static mapAddressOptions = (addressDetails: { includeAddressRecordsType?: string } | undefined): string => {
        if (addressDetails === undefined || addressDetails.includeAddressRecordsType === undefined) {
            return "No";
        }
        switch (addressDetails.includeAddressRecordsType) {
        case AddressRecordsType.CURRENT:
            return "Current address";

        case AddressRecordsType.CURRENT_AND_PREVIOUS:
            return "Current address and the one previous";

        case AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR:
            return "Current address and the two previous";

        case AddressRecordsType.ALL:
            return "All current and previous addresses";

        default:
            logger.error(`Unable to map value for registered office address options: ${addressDetails.includeAddressRecordsType}`);
            return "";
        }
    }

    static determineDirectorOrSecretaryOptionsText = (directorOrSecretaryDetails: DirectorOrSecretaryDetails | undefined, officer: string) => {
        if (directorOrSecretaryDetails === undefined || !directorOrSecretaryDetails.includeBasicInformation) {
            return "No";
        }
        const directorOrSecretaryOptions: string[] = [];

        if (directorOrSecretaryDetails.includeAddress) {
            directorOrSecretaryOptions.push("Correspondence address");
        }
        if (directorOrSecretaryDetails.includeOccupation) {
            directorOrSecretaryOptions.push("Occupation");
        }
        if (directorOrSecretaryDetails.includeDobType === "partial") {
            directorOrSecretaryOptions.push("Date of birth (month and year)");
        }
        if (directorOrSecretaryDetails.includeAppointmentDate) {
            directorOrSecretaryOptions.push("Appointment date");
        }
        if (directorOrSecretaryDetails.includeNationality) {
            directorOrSecretaryOptions.push("Nationality");
        }
        if (directorOrSecretaryDetails.includeCountryOfResidence) {
            directorOrSecretaryOptions.push("Country of residence");
        }
        if (directorOrSecretaryOptions.length > 0) {
            directorOrSecretaryOptions.unshift("Including " + officer + "':", "");
        } else {
            return "Yes";
        }
        return MapUtil.mapToHtml(directorOrSecretaryOptions);
    }

    static mapMembersOptions = (heading: string, memberOptions?: MemberDetails): string => {
        if (memberOptions === undefined || memberOptions.includeBasicInformation === undefined) {
            return "No";
        }

        if (memberOptions.includeBasicInformation === true &&
            memberOptions.includeAddress === false &&
            memberOptions.includeAppointmentDate === false &&
            memberOptions.includeCountryOfResidence === false &&
            memberOptions.includeDobType === undefined) {
            return "Yes";
        }

        const membersMappings: string[] = [];
        membersMappings.push(heading);
        membersMappings.push("");

        if (memberOptions.includeAddress) {
            membersMappings.push("Correspondence address");
        }

        if (memberOptions.includeAppointmentDate) {
            membersMappings.push("Appointment date");
        }

        if (memberOptions.includeCountryOfResidence) {
            membersMappings.push("Country of residence");
        }

        if (memberOptions.includeDobType === "partial" ||
            memberOptions.includeDobType === "full") {
            membersMappings.push("Date of birth (month and year)");
        }

        return MapUtil.mapToHtml(membersMappings);
    }

    static getDeliveryDetailsTable = (deliveryDetails: DeliveryDetails | undefined): object[] | null => {
        if (!deliveryDetails) {
            return null;
        }
        return [
            {
                key: {
                    classes: "govuk-!-width-one-half",
                    text: "Delivery address"
                },
                value: {
                    classes: "govuk-!-width-one-half",
                    html: "<p id='delivery-address-value'>" + MapUtil.mapDeliveryDetails(deliveryDetails) + "</p>"
                },
                actions: {
                    items: [{
                        attributes: {
                            "data-event-id": "change-delivery-address",
                            id: "change-delivery-details"
                        },
                        href: "/delivery-details",
                        text: "Change"
                    }]
                }
            }
        ];
    };

    static getPaymentDetails = (checkout: Checkout, payment: Payment): PaymentDetails => {
        return {
            amount: "£" + checkout?.totalOrderCost,
            paymentReference: payment.reference || "",
            orderedAt: payment.completedAt ? mapDate(payment.completedAt) : ""
        };
      };

    static getOrderDetails = (checkout: Checkout): OrderDetails => {
        return {
            referenceNumber: checkout.reference,
            referenceNumberAriaLabel: checkout.reference.replace(/-/g, " hyphen ")
        };
    }
}
