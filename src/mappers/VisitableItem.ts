import { ItemVisitor } from "./ItemVisitor";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order";

export class VisitableItem {

    constructor(public item: Item) {
    }

    accept(visitor: ItemVisitor) {
        visitor.visit(this);
    }
}
