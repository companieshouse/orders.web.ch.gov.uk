import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { mapDate } from "../utils/date.util";

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
    map (checkout: Checkout): Record<string, any>;
}

export abstract class AbstractTemplateMapper implements ConfirmationTemplateMapper {
    abstract map (checkout: Checkout): Record<string, any>;

    protected getPaymentDetails (checkout: Checkout): PaymentDetails {
        return {
            amount: "£" + checkout?.totalOrderCost,
            paymentReference: checkout.paymentReference,
            orderedAt: mapDate(checkout.paidAt)
        };
    }

    protected getOrderDetails (checkout: Checkout): OrderDetails {
        return {
            referenceNumber: checkout.reference,
            referenceNumberAriaLabel: checkout.reference.replace(/-/g, " hyphen ")
        };
    }
}
