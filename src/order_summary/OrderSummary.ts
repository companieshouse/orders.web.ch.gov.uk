export class OrderSummary {
    orderReference: string;
    itemSummary: ItemSummary[] = [];
    deliveryAddress: DeliveryAddress;
    paymentDetails: PaymentDetails;
}

export class DeliveryAddress {
    forename: string;
    surname: string;
    addressLine1: string;
    addressLine2: string;
    country: string;
    locality: string;
    poBox: string;
    postalCode: string;
    region: string;
}

export class ItemSummary {
    itemNumber: string;
    orderType: string;
    companyNumber: string;
    deliveryMethod: string;
    fee: string;
}

export class PaymentDetails {
    paymentReference: string;
    amountPaid: string;
}
