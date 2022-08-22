import { GovUkOrderItemSummaryView } from "./GovUkOrderItemSummaryView";
import { GovUkTableCell } from "../govuk/GovUkTableCell";

export class GovUkOrderCertifiedCopyItemSummaryView {
    orderDetails: GovUkOrderItemSummaryView = new GovUkOrderItemSummaryView();
    documentDetails: GovUkTableCell[][] = [];
}
