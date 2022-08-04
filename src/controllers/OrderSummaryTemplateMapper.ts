import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { AbstractTemplateMapper } from "./ConfirmationTemplateMapper";
import { ItemOptions as CertificateItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { ItemOptions as CertifiedCopyItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { ORDER_COMPLETE_ABBREVIATED } from "../model/template.paths";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";

export const PAGE_TITLE = "Order received - GOV.UK";

type OrderStatus = {
    hasMissingImageDeliveryItems: boolean,
    hasExpressDeliveryItems: boolean,
    hasStandardDeliveryItems: boolean
};

export class OrderSummaryTemplateMapper extends AbstractTemplateMapper {
    map (checkout: Checkout): Record<string, any> {
        const orderDetails = this.getOrderDetails(checkout);
        const paymentDetails = this.getPaymentDetails(checkout);
        const orderStatus = this.buildOrderStatus(checkout.items);
        return {
            pageTitleText: PAGE_TITLE,
            orderDetails,
            paymentDetails,
            ...orderStatus,
            templateName: ORDER_COMPLETE_ABBREVIATED
        };
    }

    private buildOrderStatus(items: Item[]): OrderStatus {
        let hasMissingImageDeliveryItems = false;
        let hasExpressDeliveryItems = false;
        let hasStandardDeliveryItems = false;
        for (const item of items) {
            if (item.kind === "item#missing-image-delivery") {
                hasMissingImageDeliveryItems = true;
            } else if (item.kind === "item#certificate") {
                if ((item.itemOptions as CertificateItemOptions).deliveryTimescale === "same-day") {
                    hasExpressDeliveryItems = true;
                } else {
                    hasStandardDeliveryItems = true;
                }
            } else if (item.kind === "item#certified-copy") {
                if ((item.itemOptions as CertifiedCopyItemOptions).deliveryTimescale === "same-day") {
                    hasExpressDeliveryItems = true;
                } else {
                    hasStandardDeliveryItems = true;
                }
            }
        }
        return {
            hasMissingImageDeliveryItems,
            hasExpressDeliveryItems,
            hasStandardDeliveryItems
        };
    }
}
