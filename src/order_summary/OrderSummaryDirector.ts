import { Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { OrderSummaryConverter } from "./OrderSummaryConverter";

export class OrderSummaryDirector {

    private converter: OrderSummaryConverter;

    constructor (converter: OrderSummaryConverter) {
        this.converter = converter;
    }

    mapOrderSummary(order: Order): void {
        for (const item of order.items) {
            if (item.kind === "item#certificate") {
                this.converter.mapCertificate({
                    orderId: order.reference,
                    item: item
                });
            } else if (item.kind === "item#certified-copy") {
                this.converter.mapCertifiedCopy({
                    orderId: order.reference,
                    item: item
                });
            } else if (item.kind === "item#missing-image-delivery") {
                this.converter.mapMissingImageDelivery({
                    orderId: order.reference,
                    item: item
                });
            }
        }
        this.converter.mapOrderDetails(order);
    }
}
