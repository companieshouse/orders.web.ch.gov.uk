import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";
import {GovSummaryListObject, GovUkSummaryListEntry} from "../govuk/GovUkSummaryList";
import {mapFilingHistoryDate} from "../utils/date.util";

export class MissingImageDeliveryMapper implements OrderItemMapper {
    private data: GovUkOrderItemSummaryView

    constructor (private item: Item) {
    }

    map (orderId: string): void {
        this.data.orderId = orderId;
        this.data.itemId = this.item.id;
        this.mapItemDetails(this.item);
    }

    getMappedOrder (): OrderItemView {
        return undefined as any;
    }

    private mapItemDetails(item: Item) : void {

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
                   text: this.item.companyNumber,
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
                   text: "Company number",
                   html: ""
               } as GovSummaryListObject,
               value: {
                   classes: "govuk-!-width-two-thirds",
                   text: this.item.companyNumber,
                   html: ""
               } as GovSummaryListObject
           } as GovUkSummaryListEntry,
       )
    }
}
