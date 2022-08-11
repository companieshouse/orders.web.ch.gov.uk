import { GovUkTableCellView } from "../mappers/BasketDetailsViewModel";

export class OrderSummary {
    orderReference: string;
    itemSummary: GovUkTableCellView[][] = [];
    deliveryAddress: object;
    hasDeliverableItems: boolean = false;
    paymentDetails: PaymentDetails;
}

export class PaymentDetails {
    paymentReference: string;
    amountPaid: string;
}
