import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { OrderItemMapper } from "./OrderItemMapper";

export class OrderItemSummaryFactory {
    getMapper (item: Item): OrderItemMapper {
        return undefined as any;
    }
}
