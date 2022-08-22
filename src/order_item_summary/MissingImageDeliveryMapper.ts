import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";
import { mapFilingHistoryDate } from "../utils/date.util";
import { mapFilingHistory } from "../service/filing.history.service";
import { MapperRequest } from "../mappers/MapperRequest";
import { ORDER_ITEM_SUMMARY_MID } from "../model/template.paths";

export class MissingImageDeliveryMapper implements OrderItemMapper {
    private data: GovUkOrderItemSummaryView

    constructor (private mapperRequest: MapperRequest) {
        this.data = new GovUkOrderItemSummaryView();
    }

    map (): void {
        this.data.orderId = this.mapperRequest.orderId;
        this.data.itemId = this.mapperRequest.item.id;
        this.data.backLinkUrl = `/orders/${this.mapperRequest.orderId}`
        this.mapItemDetails();
    }

    getMappedOrder (): OrderItemView {
        return {
            template: ORDER_ITEM_SUMMARY_MID,
            data: this.data
        };
    }

    private mapItemDetails (): void {
        const itemOptions = this.mapperRequest.item.itemOptions as MissingImageDeliveryItemOptions;
        this.data.itemDetails.entries.push(
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: this.mapperRequest.item.companyName
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: this.mapperRequest.item.companyNumber
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
                    text: "£" + this.mapperRequest.item.totalItemCost
                }
            }
        );
    }
}
