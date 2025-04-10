import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { mapItem } from "../service/map.item.service";
import { ORDER_COMPLETE } from "../model/template.paths";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import {
    CERTIFICATE_PAGE_TITLE,
    CERTIFIED_COPY_PAGE_TITLE,
    ConfirmationTemplateMapper,
    MID_PAGE_TITLE
} from "./ConfirmationTemplateMapper";
import { MapUtil } from "../service/MapUtil";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";

export class SingleItemTemplateMapper implements ConfirmationTemplateMapper {
    map (checkout: Checkout, payment: Payment): Record<string, any> {
        const item = checkout.items[0];
        const mappedItem = mapItem(item, checkout?.deliveryDetails);
        return {
            ...mappedItem,
            companyNumber: item.companyNumber,
            orderDetails: MapUtil.getOrderDetails(checkout),
            paymentDetails: MapUtil.getPaymentDetails(checkout,payment),
            itemKind: item.kind,
            piwikLink: this.getPiwikURL(item),
            totalItemsCost: `£${item?.totalItemCost}`,
            templateName: ORDER_COMPLETE,
            pageTitleText: this.getPageTitle(item.kind)
        };
    }

    private getPiwikURL (item: Item): string {
        if (item?.kind === "item#certificate") {
            return "certificates";
        }
        if (item?.kind === "item#certified-copy") {
            return "certified-copies";
        }
        return "";
    }

    private getPageTitle (kind: string): string {
        if (kind === "item#certificate") {
            return CERTIFICATE_PAGE_TITLE;
        } else if (kind === "item#certified-copy") {
            return CERTIFIED_COPY_PAGE_TITLE;
        } else if (kind === "item#missing-image-delivery") {
            return MID_PAGE_TITLE;
        } else {
            return "";
        }
    }
}
