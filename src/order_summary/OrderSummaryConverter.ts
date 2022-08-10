import { Item, Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { OrderSummary } from "./OrderSummary";
import { ItemOptionsDeliveryTimescaleConfigurable } from "@companieshouse/api-sdk-node/dist/services/order/types";

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
        this.orderSummary.itemSummary.push({
            itemNumber: item.id,
            companyNumber: item.companyNumber,
            orderType: itemType,
            deliveryMethod: deliveryMethod,
            fee: `£${item.totalItemCost}`
        });
    }

    private mapDeliveryAddress(order: Order) {
        this.orderSummary.deliveryAddress = {
            forename: order.deliveryDetails?.forename || "",
            surname: order.deliveryDetails?.surname || "",
            addressLine1: order.deliveryDetails?.addressLine1 || "",
            addressLine2: order.deliveryDetails?.addressLine2 || "",
            country: order.deliveryDetails?.country || "",
            locality: order.deliveryDetails?.locality || "",
            poBox: order.deliveryDetails?.poBox || "",
            postalCode: order.deliveryDetails?.postalCode || "",
            region: order.deliveryDetails?.region || "",
        };
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
