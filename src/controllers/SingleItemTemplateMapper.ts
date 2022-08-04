import {Checkout} from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import {mapItem} from "../service/map.item.service";
import {ORDER_COMPLETE} from "../model/template.paths";
import {Item} from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import {
    AbstractTemplateMapper,
    CERTIFICATE_PAGE_TITLE,
    CERTIFIED_COPY_PAGE_TITLE,
    MID_PAGE_TITLE
} from "./ConfirmationTemplateMapper";

export class SingleItemTemplateMapper extends AbstractTemplateMapper {
    map(checkout: Checkout): Record<string, any> {
        const item = checkout.items[0];
        const mappedItem = mapItem(item, checkout?.deliveryDetails);
        const companyNumber = item.companyNumber;
        const orderDetails = this.getOrderDetails(checkout);
        const paymentDetails = this.getPaymentDetails(checkout);
        const itemKind = item.kind;
        const piwikLink = this.getPiwikURL(item);
        const totalItemsCost = `£${item?.totalItemCost}`;
        const templateName = ORDER_COMPLETE;
        const pageTitleText = item?.kind === "item#certificate" ? CERTIFICATE_PAGE_TITLE : item?.kind === "item#certified-copy"
            ? CERTIFIED_COPY_PAGE_TITLE : item?.kind === "item#missing-image-delivery" ? MID_PAGE_TITLE : "";

        return {
            ...mappedItem,
            companyNumber,
            orderDetails,
            paymentDetails,
            itemKind,
            piwikLink,
            totalItemsCost,
            templateName,
            pageTitleText
        };
    }

    private getPiwikURL(item: Item): string {
        if (item?.kind === "item#certificate") {
            return "certificates";
        }

        if (item?.kind === "item#certified-copy") {
            return "certified-copies";
        }

        return "";
    }
}
