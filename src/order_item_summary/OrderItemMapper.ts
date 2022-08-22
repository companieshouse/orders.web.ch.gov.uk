import { OrderItemView } from "./OrderItemView";

export interface OrderItemMapper {
    map(): void;
    getMappedOrder(): OrderItemView;
}
