import { GovUkTableCellView } from "../mappers/BasketDetailsViewModel";

export class OrderSummary {
    orderReference: string;
    itemSummary: GovUkTableCellView[][] = [];
    deliveryAddress: object;
    paymentDetails: PaymentDetails;
}

export class PaymentDetails {
    paymentReference: string;
    amountPaid: string;
}
