import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { MapperRequest } from "./MapperRequest";

export class CertifiedCopyMapper implements OrderItemMapper {
    constructor (private mapperRequest: MapperRequest) {
    }

    getMappedOrder (): OrderItemView {
        return undefined as any;
    }

    map (): void {
    }
}
