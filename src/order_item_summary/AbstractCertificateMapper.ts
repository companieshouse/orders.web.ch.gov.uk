import { OrderItemMapper } from "./OrderItemMapper";
import { OrderItemView } from "./OrderItemView";
import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";
import { MapperRequest } from "../mappers/MapperRequest";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { MapUtil } from "../service/MapUtil";
import { ORDER_ITEM_SUMMARY_CERTIFICATE } from "../model/template.paths";

export abstract class AbstractCertificateMapper implements OrderItemMapper {

    protected readonly data: GovUkOrderItemSummaryView

    constructor (protected mapperRequest: MapperRequest) {
        this.data = new GovUkOrderItemSummaryView();
    }

    map (): void {
        this.data.orderId = this.mapperRequest.orderId;
        this.data.itemId = this.mapperRequest.item.id;
        this.mapCompanyDetails();
        this.mapCertificateDetails();
        this.mapDeliveryDetails();
        this.mapFee();
        this.data.backLinkUrl = `/orders/${this.mapperRequest.orderId}`;
    }

    getMappedOrder (): OrderItemView {
        return {
            template: ORDER_ITEM_SUMMARY_CERTIFICATE,
            data: this.data
        };
    }

    protected abstract mapCertificateDetails(): void;

    protected addText(key: string, value: string): void {
        this.data.itemDetails.entries.push(
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: key
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: value
                }
            }
        );
    }

    protected addHtml(key: string, value: string): void {
        this.data.itemDetails.entries.push(
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: key
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: value
                }
            }
        );
    }

    private mapCompanyDetails(): void {
        this.addText("Company name", this.mapperRequest.item.companyName);
        this.addText("Company number", this.mapperRequest.item.companyNumber);
    }

    private mapDeliveryDetails(): void {
        const itemOptions = this.mapperRequest.item.itemOptions as CertificateItemOptions;
        this.addText("Dispatch method", MapUtil.mapDeliveryMethod(itemOptions) || "");
        this.addText("Email copy required", MapUtil.mapEmailCopyRequired(itemOptions));
    }

    private mapFee(): void {
        this.addText("Fee", `£${this.mapperRequest.item.totalItemCost}`);
    }

}
