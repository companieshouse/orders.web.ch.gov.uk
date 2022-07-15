import { SERVICE_NAME_BASKET } from "../config/config";

export class BasketDetailsViewModel {
    certificates: GovUkTableCellView[][] = [];
    certifiedCopies: GovUkTableCellView[][] = [];
    missingImageDelivery: GovUkTableCellView[][] = [];
    totalItemCost: number = 0;
    deliveryDetailsTable: object[] | null;
    serviceName: string = SERVICE_NAME_BASKET;
}

export class GovUkTableCellView {
    text?: string | null | undefined;
    html?: string | null | undefined;
}
