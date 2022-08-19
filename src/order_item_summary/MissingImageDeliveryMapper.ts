import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";

export class MissingImageDeliveryMapper implements OrderItemMapper {
    private data: GovUkOrderItemSummaryView

    constructor (private item: Item) {
    }

    map (orderId: string): void {

    }

    getMappedOrder (): OrderItemView {
        return undefined as any;
    }
}
