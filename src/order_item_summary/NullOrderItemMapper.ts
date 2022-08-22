import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";

export class NullOrderItemMapper implements OrderItemMapper {
    getMappedOrder (): OrderItemView {
        throw new Error("Mapper not found");
    }

    map (): void {
        throw new Error("Mapper not found");
    }
}
