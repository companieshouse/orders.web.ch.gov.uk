import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { GovUkOrderCertifiedCopyItemSummaryView } from "./GovUkOrderCertifiedCopyItemSummaryView";
import { ORDER_ITEM_SUMMARY_CERTIFIED_COPY } from "../model/template.paths";
import { MapUtil } from "../service/MapUtil";
import { mapFilingHistoryDate } from "../utils/date.util";
import { ItemOptions as CertifiedCopyItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { mapFilingHistory } from "../service/filing.history.service";
import { MapperRequest } from "../mappers/MapperRequest";

export class CertifiedCopyMapper implements OrderItemMapper {
    private readonly data: GovUkOrderCertifiedCopyItemSummaryView;

    constructor (private mapperRequest: MapperRequest) {
        this.data = new GovUkOrderCertifiedCopyItemSummaryView();
    }

    map (): void {
        this.data.orderDetails.orderId = this.mapperRequest.orderId;
        this.data.orderDetails.itemId = this.mapperRequest.item.id;
        this.mapItemDetails();
        this.data.orderDetails.backLinkUrl = `/orders/${this.mapperRequest.orderId}`;
        this.mapDocumentDetails();
    }

    getMappedOrder (): OrderItemView {
        return {
            template: ORDER_ITEM_SUMMARY_CERTIFIED_COPY,
            data: this.data
        };
    }

    private mapItemDetails (): void {
        this.data.orderDetails.itemDetails.entries.push(
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
                    text: "Delivery method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: MapUtil.mapDeliveryMethod(this.mapperRequest.item.itemOptions) || ""
                }
            }
        );
    }

    private mapDocumentDetails (): void {
        const itemOptions = this.mapperRequest.item.itemOptions as CertifiedCopyItemOptions;
        this.data.documentDetails.push([
            {
                text: mapFilingHistoryDate(itemOptions.filingHistoryDocuments[0].filingHistoryDate)
            },
            {
                text: itemOptions.filingHistoryDocuments[0].filingHistoryType
            },
            {
                text: mapFilingHistory(
                    itemOptions.filingHistoryDocuments[0].filingHistoryDescription,
                    itemOptions.filingHistoryDocuments[0].filingHistoryDescriptionValues || {}
                )
            },
            {
                text: `£${this.mapperRequest.item.totalItemCost}`
            }
        ]);
    }
}
