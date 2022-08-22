import { Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { OrderSummary } from "./OrderSummary";
import { ItemOptionsDeliveryTimescaleConfigurable } from "@companieshouse/api-sdk-node/dist/services/order/types";
import { MapUtil } from "../service/MapUtil";
import { CHS_URL } from "../config/config";
import { MapperRequest } from "../mappers/MapperRequest";

export class OrderSummaryConverter {

    private orderSummary: OrderSummary = new OrderSummary();

    mapOrderDetails(order: Order): void {
        this.orderSummary.orderReference = order.reference;
        this.mapDeliveryAddress(order);
        this.mapPaymentDetails(order);
        this.orderSummary.backLinkUrl = CHS_URL;
    }

    mapCertificate(request: MapperRequest): void {
        this.mapItem(request, "Certificate", this.mapDeliveryMethod(request.item.itemOptions as ItemOptionsDeliveryTimescaleConfigurable));
        this.orderSummary.hasDeliverableItems = true;
    }

    mapCertifiedCopy(request: MapperRequest): void {
        this.mapItem(request, "Certified document", this.mapDeliveryMethod(request.item.itemOptions as ItemOptionsDeliveryTimescaleConfigurable));
        this.orderSummary.hasDeliverableItems = true;
    }

    mapMissingImageDelivery(request: MapperRequest): void {
        this.mapItem(request, "Missing image", "N/A");
    }

    getOrderSummary(): OrderSummary {
        return this.orderSummary;
    }

    private mapItem(request: MapperRequest, itemType: string, deliveryMethod: string): void {
        this.orderSummary.itemSummary.push([
            { html: `<a class="govuk-link" href="/orders/${request.orderId}/items/${request.item.id}">${request.item.id}</a>` },
            { text: itemType },
            { text: request.item.companyNumber },
            { text: deliveryMethod },
            { text: `£${request.item.totalItemCost}` }
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
