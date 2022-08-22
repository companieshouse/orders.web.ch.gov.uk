import { GovUkSummaryList } from "../govuk/GovUkSummaryList";

export class GovUkOrderItemSummaryView {
    orderId: string;
    itemId: string;
    itemDetails: GovUkSummaryList = new GovUkSummaryList();
    backLinkUrl: string;
}
