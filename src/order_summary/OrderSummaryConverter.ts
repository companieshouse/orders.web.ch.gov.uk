import { Item, Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { OrderSummary } from "./OrderSummary";
import { ItemOptionsDeliveryTimescaleConfigurable } from "@companieshouse/api-sdk-node/dist/services/order/types";
import { MapUtil } from "../service/MapUtil";

export class OrderSummaryConverter {

    private orderSummary: OrderSummary = new OrderSummary();

    mapOrderDetails(order: Order): void {
        this.orderSummary.orderReference = order.reference;
        this.mapDeliveryAddress(order);
        this.mapPaymentDetails(order);
    }

    mapCertificate(item: Item): void {
        this.mapItem(item, "Certificate", this.mapDeliveryMethod(item.itemOptions as ItemOptionsDeliveryTimescaleConfigurable));
    }

    mapCertifiedCopy(item: Item): void {
        this.mapItem(item, "Certified document", this.mapDeliveryMethod(item.itemOptions as ItemOptionsDeliveryTimescaleConfigurable));
    }

    mapMissingImageDelivery(item: Item): void {
        this.mapItem(item, "Missing image", "N/A");
    }

    getOrderSummary(): OrderSummary {
        return this.orderSummary;
    }

    private mapItem(item: Item, itemType: string, deliveryMethod: string): void {
        this.orderSummary.itemSummary.push([
            { html: `<a class="govuk-link" href="javascript:void(0)">${item.id}</a>` },
            { text: item.companyNumber },
            { text: itemType },
            { text: deliveryMethod },
            { text: `£${item.totalItemCost}` }
        ]);
    }

    private mapDeliveryAddress(order: Order) {
        this.orderSummary.deliveryAddress = {
            key: {
                classes: "govuk-!-width-one-half",
                text: "Delivery address"
            },
            value: {
                classes: "govuk-!-width-one-half",
                html: `<p id='delivery-address-value'>${MapUtil.mapDeliveryDetails(order.deliveryDetails)}</p>`
            }
        }
    }

    private mapPaymentDetails(order: Order) {
        this.orderSummary.paymentDetails = {
            paymentReference: order.paymentReference,
            amountPaid: `£${order.totalOrderCost}`
        };
    }

    private mapDeliveryMethod(itemOptions: ItemOptionsDeliveryTimescaleConfigurable): string {
        if (itemOptions.deliveryTimescale === "standard") {
            return "Standard";
        } else if (itemOptions.deliveryTimescale === "same-day") {
            return "Express";
        } else {
            return "";
        }
    }
}
