import { OrderSummary } from "./OrderSummary";
import { getOrder } from "../client/api.client";
import { OrderSummaryDirector } from "./OrderSummaryDirector";
import { OrderSummaryConverter } from "./OrderSummaryConverter";

export interface OrderSummaryFetchable {
    fetchOrderSummary(orderId: string, token: string): Promise<OrderSummary>;
}

export class OrderSummaryService implements OrderSummaryFetchable {
    async fetchOrderSummary(orderId: string, token: string): Promise<OrderSummary> {
        const order = await getOrder(orderId, token);
        const converter = new OrderSummaryConverter();
        const mapper = new OrderSummaryDirector(converter);
        mapper.mapOrderSummary(order);
        return converter.getOrderSummary();
    }
}
