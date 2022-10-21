import { VisitableItem } from "./VisitableItem";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { MapUtil } from "../service/MapUtil";
import { ItemOptions as CertifiedCopyItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { mapFilingHistoriesDocuments } from "../service/map.item.service";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";
import { BasketDetailsViewModel } from "./BasketDetailsViewModel";

const PUSH_REMOVE_ITEM_EVENT_TO_MATOMO = "javascript:_paq.push(['trackEvent', 'view-basket', 'remove-item'])";
const PUSH_VIEW_CHANGE_CERTIFICATE_OPTIONS_EVENT_TO_MATOMO =
    "javascript:_paq.push(['trackEvent', 'view-basket', 'view-change-certificate-options'])";

export class ItemVisitor {
    constructor(private viewModel: BasketDetailsViewModel) {
    }

    visit (item: VisitableItem) {
        if (item.item.kind === "item#certificate") {
            const itemOptions = item.item.itemOptions as CertificateItemOptions;
            this.setDeliveryMethodHelptext(itemOptions);
            this.viewModel.certificates.push([
                {
                    text: MapUtil.mapCertificateType(itemOptions?.certificateType)
                },
                {
                    text: item.item.companyNumber
                },
                {
                    text: MapUtil.mapBasketDeliveryMethod(itemOptions)
                },
                {
                    text: `£${item.item.totalItemCost}`
                },
                {
                    html: `<a class="govuk-link"
                              href="${this.getViewChangeCertOptionsLink(item.item.id, itemOptions.companyType)}"
                              onclick="${PUSH_VIEW_CHANGE_CERTIFICATE_OPTIONS_EVENT_TO_MATOMO}">
                              View/Change certificate options
                           </a>`
                },
                {
                    html: `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="submit"
                                       class="removeItem"
                                       onclick="${PUSH_REMOVE_ITEM_EVENT_TO_MATOMO}"
                                       value="Remove">
                            </form>`
                }
            ]);
        } else if (item.item.kind === "item#certified-copy") {
            const itemOptions = item.item.itemOptions as CertifiedCopyItemOptions;
            const mappedFilingHistory = mapFilingHistoriesDocuments(itemOptions?.filingHistoryDocuments || []);
            this.setDeliveryMethodHelptext(itemOptions);
            this.viewModel.certifiedCopies.push([
                {
                    text: mappedFilingHistory[0]?.filingHistoryDate
                },
                {
                    text: mappedFilingHistory[0]?.filingHistoryType
                },
                {
                    text: mappedFilingHistory[0]?.filingHistoryDescription
                },
                {
                    text: item.item.companyNumber
                },
                {
                    text: MapUtil.mapBasketDeliveryMethod(itemOptions)
                },
                {
                    text: `£${item.item.totalItemCost}`
                },
                {
                    html: `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="submit"
                                       class="removeItem"
                                       onclick="${PUSH_REMOVE_ITEM_EVENT_TO_MATOMO}"
                                       value="Remove">
                            </form>`
                }
            ]);
        } else if (item.item.kind === "item#missing-image-delivery") {
            const itemOptions = item.item.itemOptions as MissingImageDeliveryItemOptions;
            const mappedFilingHistory = mapFilingHistoriesDocuments([itemOptions]);
            this.viewModel.missingImageDelivery.push([
                {
                    text: mappedFilingHistory[0]?.filingHistoryDate
                },
                {
                    text: mappedFilingHistory[0]?.filingHistoryType
                },
                {
                    text: mappedFilingHistory[0]?.filingHistoryDescription
                },
                {
                    text: item.item.companyNumber
                },
                {
                    text: `£${item.item.totalItemCost}`
                },
                {
                    html: `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="submit"
                                       class="removeItem"
                                       onclick="${PUSH_REMOVE_ITEM_EVENT_TO_MATOMO}"
                                       value="Remove">
                            </form>`
                }
            ]);
        } else {
            throw Error(`Unknown item type: [${item.item.kind}]`);
        }
        this.viewModel.totalItemCost += parseInt(item.item.totalItemCost);
    }

    private getViewChangeCertOptionsLink (certificateId: string, companyType: string): string {
        if (companyType === "llp") {
            return `/orderable/llp-certificates/${certificateId}/view-change-options`;
        } else if (companyType === "limited-partnership") {
            return `/orderable/lp-certificates/${certificateId}/view-change-options`;
        } else {
            return `/orderable/certificates/${certificateId}/view-change-options`;
        }
    }

    private setDeliveryMethodHelptext(itemOptions: Record<string, any>) {
        if (itemOptions?.deliveryTimescale === "standard") {
            this.viewModel.hasStandardDelivery = true;
        }
        if (itemOptions?.deliveryTimescale === "same-day") {
            this.viewModel.hasSameDayDelivery = true;
        }
    }
}
