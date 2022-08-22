import { GovUkTableCell } from "../govuk/GovUkTableCell";

export class OrderSummary {
    orderReference: string;
    itemSummary: GovUkTableCell[][] = [];
    deliveryAddress: object;
    hasDeliverableItems: boolean = false;
    paymentDetails: PaymentDetails;
    backLinkUrl: string;
}

export class PaymentDetails {
    paymentReference: string;
    amountPaid: string;
}
