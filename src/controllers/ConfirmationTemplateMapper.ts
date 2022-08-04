import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { mapItem } from "../service/map.item.service";
import { mapDate } from "../utils/date.util";
import { ORDER_COMPLETE } from "../model/template.paths";

export const CERTIFICATE_PAGE_TITLE = "Certificate ordered - Order a certificate - GOV.UK";
export const CERTIFIED_COPY_PAGE_TITLE = "Certified document order confirmed - Order a certified document - GOV.UK";
export const MID_PAGE_TITLE = "Document Requested - Request a document - GOV.UK";

export interface ConfirmationTemplateMapper {
    map(item: Checkout): Record<string, any>;
}

export abstract class AbstractTemplateMapper implements ConfirmationTemplateMapper {
    abstract map (item: Checkout): Record<string, any>;
    protected abstract getPiwikURL(item: Item): string;
}

export class SingleItemTemplateMapper extends AbstractTemplateMapper {
    map (checkout: Checkout): Record<string, any> {
        const item = checkout.items[0];
        const mappedItem = mapItem(item, checkout?.deliveryDetails);
        const companyNumber = item.companyNumber;
        const orderDetails = {
            referenceNumber: checkout.reference,
            referenceNumberAriaLabel: checkout.reference.replace(/-/g, " hyphen ")
        };
        const paymentDetails = {
            amount: "£" + checkout?.totalOrderCost,
            paymentReference: checkout.paymentReference,
            orderedAt: mapDate(checkout.paidAt)
        };
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
        }
    }

    protected getPiwikURL (item: Item): string {
        if (item?.kind === "item#certificate") {
            return "certificates";
        }

        if (item?.kind === "item#certified-copy") {
            return "certified-copies";
        }

        return "";
    }
}

export class OrderSummaryTemplateMapper extends AbstractTemplateMapper {
    map (item: Checkout): Record<string, any> {
        return undefined as any;
    }

    protected getPiwikURL (item: Item): string {
        return "";
    }
}
