import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { ORDER_COMPLETE_ABBREVIATED } from "../model/template.paths";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { MapUtil } from "../service/MapUtil";
import { ConfirmationTemplateMapper } from "./ConfirmationTemplateMapper";
import { ItemOptionsDeliveryTimescaleConfigurable } from "@companieshouse/api-sdk-node/dist/services/order/types";
import { BasketLink } from "../utils/basket.util";
import { PageHeader } from "../model/PageHeader";

export const PAGE_TITLE = "Order received - GOV.UK";
export const PANEL_TITLE = "Order received";

type OrderStatus = {
    hasMissingImageDeliveryItems: boolean,
    hasExpressDeliveryItems: boolean,
    hasStandardDeliveryItems: boolean
};

export class OrderSummaryTemplateMapper implements ConfirmationTemplateMapper {
    map (checkout: Checkout, basketLink: BasketLink, pageHeader: PageHeader): Record<string, any> {
        const orderStatus = this.buildOrderStatus(checkout.items)
        const view = {
            pageTitleText: PAGE_TITLE,
            titleText: PANEL_TITLE,
            orderDetails: MapUtil.getOrderDetails(checkout),
            paymentDetails: MapUtil.getPaymentDetails(checkout),
            ...this.buildOrderStatus(checkout.items),
            templateName: ORDER_COMPLETE_ABBREVIATED,
            ...basketLink,
            ...pageHeader
        };
        if (orderStatus.hasStandardDeliveryItems || orderStatus.hasExpressDeliveryItems) {
            view["deliveryDetailsTable"] = this.buildDeliveryDetails(MapUtil.mapDeliveryDetails(checkout.deliveryDetails));
        }
        return view;
    }

    private buildOrderStatus(items: Item[]): OrderStatus {
        let hasMissingImageDeliveryItems = false;
        let hasExpressDeliveryItems = false;
        let hasStandardDeliveryItems = false;
        for (const item of items) {
            if (item.kind === "item#missing-image-delivery") {
                hasMissingImageDeliveryItems = true;
            } else if ((item.itemOptions as ItemOptionsDeliveryTimescaleConfigurable).deliveryTimescale === "same-day") {
                    hasExpressDeliveryItems = true;
            } else {
                hasStandardDeliveryItems = true;
            }
            if (hasMissingImageDeliveryItems && hasExpressDeliveryItems && hasStandardDeliveryItems) {
                break;
            }
        }
        return {
            hasMissingImageDeliveryItems,
            hasExpressDeliveryItems,
            hasStandardDeliveryItems
        };
    }

    private buildDeliveryDetails(address: string): object {
        return {
            key: {
                classes: "govuk-!-width-one-half",
                text: "Delivery address"
            },
            value: {
                classes: "govuk-!-width-one-half",
                html: "<p id='deliveryAddressValue'>" + address + "</p>"
            }
        }
    }
}
