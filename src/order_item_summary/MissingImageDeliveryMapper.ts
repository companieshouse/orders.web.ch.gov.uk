import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";
import { GovSummaryListObject, GovUkSummaryList, GovUkSummaryListEntry } from "../govuk/GovUkSummaryList";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";
import { mapFilingHistoryDate } from "../utils/date.util";
import { mapFilingHistory } from "../service/filing.history.service";

export class MissingImageDeliveryMapper implements OrderItemMapper {
    private data: GovUkOrderItemSummaryView

    constructor (private item: Item) {
    }

    map (orderId: string): void {
        this.data.orderId = orderId;
        this.data.itemId = this.item.id;
        this.mapItemDetails();
        this.data.fee = this.item.totalItemCost;
    }

    getMappedOrder (): OrderItemView {
        return {
            template: "order-item-summary-mid.html",
            data: this.data
        };
    }

    private mapItemDetails (): void {
        const itemOptions = this.item.itemOptions as MissingImageDeliveryItemOptions;
        this.data.itemDetails.entries.push(
           {
               key: {
                   classes: "govuk-!-width-one-third",
                   text: "Company name",
                   html: ""
               } as GovSummaryListObject,
               value: {
                   classes: "govuk-!-width-two-thirds",
                   text: this.item.companyName,
                   html: ""
               } as GovSummaryListObject
           } as GovUkSummaryListEntry,
           {
               key: {
                   classes: "govuk-!-width-one-third",
                   text: "Company number",
                   html: ""
               } as GovSummaryListObject,
               value: {
                   classes: "govuk-!-width-two-thirds",
                   text: this.item.companyNumber,
                   html: ""
               } as GovSummaryListObject
           } as GovUkSummaryListEntry,
           {
               key: {
                   classes: "govuk-!-width-one-third",
                   text: "Date",
                   html: ""
               } as GovSummaryListObject,
               value: {
                   classes: "govuk-!-width-two-thirds",
                   text: mapFilingHistoryDate(itemOptions.filingHistoryDate),
                   html: ""
               } as GovSummaryListObject
           } as GovUkSummaryListEntry,
           {
               key: {
                   classes: "govuk-!-width-one-third",
                   text: "Type",
                   html: ""
               } as GovSummaryListObject,
               value: {
                   classes: "govuk-!-width-two-thirds",
                   text: itemOptions.filingHistoryType,
                   html: ""
               } as GovSummaryListObject
           } as GovUkSummaryListEntry,
           {
               key: {
                   classes: "govuk-!-width-one-third",
                   text: "Description",
                   html: ""
               } as GovSummaryListObject,
               value: {
                   classes: "govuk-!-width-two-thirds",
                   text: mapFilingHistory(itemOptions.filingHistoryDescription, itemOptions.filingHistoryDescriptionValues),
                   html: ""
               } as GovSummaryListObject
           } as GovUkSummaryListEntry
        );
    }
}
