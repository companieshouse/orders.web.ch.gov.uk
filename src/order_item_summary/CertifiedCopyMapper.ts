import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { MapperRequest } from "./MapperRequest";
import { GovUkOrderCertifiedCopyItemSummaryView } from "./GovUkOrderCertifiedCopyItemSummaryView";
import { ORDER_ITEM_SUMMARY_CERTIFIED_COPY } from "../model/template.paths";

export class CertifiedCopyMapper implements OrderItemMapper {
    private readonly data: GovUkOrderCertifiedCopyItemSummaryView;

    constructor (private mapperRequest: MapperRequest) {
        this.data = new GovUkOrderCertifiedCopyItemSummaryView();
    }

    map (): void {
        this.data.orderDetails.orderId = this.mapperRequest.orderId;
        this.data.orderDetails.itemId = this.mapperRequest.item.id;
        this.mapItemDetails();
        this.mapDocumentDetails();
    }

    getMappedOrder (): OrderItemView {
        return {
            template: ORDER_ITEM_SUMMARY_CERTIFIED_COPY,
            data: this.data
        };
    }

    private mapItemDetails (): void {

    }

    private mapDocumentDetails (): void {

    }
}
