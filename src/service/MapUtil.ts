import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";
import { AddressRecordsType } from "model/AddressRecordsType";
import { APPLICATION_NAME, DISPATCH_DAYS } from "../config/config";

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
            return "Standard delivery (aim to dispatch within " + DISPATCH_DAYS + " working days)";
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
}