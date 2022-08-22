import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";

export class MapperRequest {
    constructor (public orderId: string, public item: Item) {
    }
}
