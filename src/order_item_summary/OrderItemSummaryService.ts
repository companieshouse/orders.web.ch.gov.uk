import { OrderItemRequest } from "./OrderItemRequest";
import { OrderItemView } from "./OrderItemView";
import { OrderItemSummaryFactory } from "./OrderItemSummaryFactory";
import { getOrderItem } from "../client/api.client";
import { MapperRequest } from "../mappers/MapperRequest";

export class OrderItemSummaryService {
    constructor(private factory: OrderItemSummaryFactory = new OrderItemSummaryFactory()) {
    }

    async getOrderItem (request: OrderItemRequest): Promise<OrderItemView> {
        const orderItem = await getOrderItem(request.orderId, request.itemId, request.apiToken);
        const mapper = this.factory.getMapper(new MapperRequest(request.orderId, orderItem));
        mapper.map();
        return mapper.getMappedOrder();
    }
}
