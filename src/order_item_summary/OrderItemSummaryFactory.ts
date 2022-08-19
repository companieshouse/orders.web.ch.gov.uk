import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { OrderItemMapper } from "./OrderItemMapper";
import { MissingImageDeliveryMapper } from "./MissingImageDeliveryMapper";
import { NullOrderItemMapper } from "./NullOrderItemMapper";

export class OrderItemSummaryFactory {
    getMapper (item: Item): OrderItemMapper {
        if (item.kind === "item#missing-image-delivery") {
            return new MissingImageDeliveryMapper(item);
        } else {
            return new NullOrderItemMapper();
        }
    }
}
