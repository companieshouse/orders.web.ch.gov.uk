import { BasketLink } from "../utils/basket.util";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";

export const CERTIFICATE_PAGE_TITLE = "Certificate ordered - Order a certificate - GOV.UK";
export const CERTIFIED_COPY_PAGE_TITLE = "Certified document order confirmed - Order a certified document - GOV.UK";
export const MID_PAGE_TITLE = "Document Requested - Request a document - GOV.UK";

export type PaymentDetails = {
    amount: string;
    paymentReference: string;
    orderedAt: string;
};

export type OrderDetails = {
    referenceNumber: string;
    referenceNumberAriaLabel: string;
};

export interface ConfirmationTemplateMapper {
    map (checkout: Checkout, basketLink: BasketLink): Record<string, any>;
}
