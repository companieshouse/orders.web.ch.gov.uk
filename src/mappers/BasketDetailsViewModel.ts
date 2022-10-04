import { SERVICE_NAME_BASKET } from "../config/config";
import { GovUkTableCell } from "../govuk/GovUkTableCell";

export class BasketDetailsViewModel {
    certificates: GovUkTableCell[][] = [];
    certifiedCopies: GovUkTableCell[][] = [];
    missingImageDelivery: GovUkTableCell[][] = [];
    totalItemCost: number = 0;
    deliveryDetailsTable: object[] | null;
    hasSameDayDelivery: boolean;
    hasStandardDelivery: boolean;
    serviceName: string = SERVICE_NAME_BASKET;
}
