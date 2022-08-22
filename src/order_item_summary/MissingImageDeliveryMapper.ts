import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";
import { mapFilingHistoryDate } from "../utils/date.util";
import { mapFilingHistory } from "../service/filing.history.service";

export class MissingImageDeliveryMapper implements OrderItemMapper {
    private data: GovUkOrderItemSummaryView

    constructor (private item: Item) {
        this.data = new GovUkOrderItemSummaryView();
    }

    map (orderId: string): void {
        this.data.orderId = orderId;
        this.data.itemId = this.item.id;
        this.mapItemDetails();
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
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: this.item.companyName
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: this.item.companyNumber
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Date"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: mapFilingHistoryDate(itemOptions.filingHistoryDate)
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: itemOptions.filingHistoryType
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Description"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: mapFilingHistory(itemOptions.filingHistoryDescription, itemOptions.filingHistoryDescriptionValues)
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£" + this.item.totalItemCost
                }
            }
        );
    }
}
