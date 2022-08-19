import { OrderItemView } from "./OrderItemView";

export interface OrderItemMapper {
    map(orderId: string): void;
    getMappedOrder(): OrderItemView;
}
