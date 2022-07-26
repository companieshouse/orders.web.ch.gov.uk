import { VisitableItem } from "./VisitableItem";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { MapUtil } from "../service/MapUtil";
import { ItemOptions as CertifiedCopyItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { mapFilingHistoriesDocuments } from "../service/map.item.service";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";
import { BasketDetailsViewModel } from "./BasketDetailsViewModel";

export class ItemVisitor {
    constructor(private viewModel: BasketDetailsViewModel) {
    }

    visit (item: VisitableItem) {
        if (item.item.kind === "item#certificate") {
            const itemOptions = item.item.itemOptions as CertificateItemOptions;
            this.viewModel.certificates.push([
                {
                    text: MapUtil.mapCertificateType(itemOptions?.certificateType)
                },
                {
                    text: item.item.companyNumber
                },
                {
                    text: MapUtil.mapDeliveryMethod(itemOptions)
                },
                {
                    text: `£${item.item.totalItemCost}`
                },
                {
                    html: `<a class="govuk-link" href="${this.getViewChangeCertOptionsLink(item.item.id, itemOptions.companyType)}">View/Change certificate options</a>`
                },
                {
                    html: `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="submit" class="removeItem" value="Remove">
                            </form>`
                }
            ]);
        } else if (item.item.kind === "item#certified-copy") {
            const itemOptions = item.item.itemOptions as CertifiedCopyItemOptions;
            const mappedFilingHistory = mapFilingHistoriesDocuments(itemOptions?.filingHistoryDocuments || []);
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
                    text: MapUtil.mapDeliveryMethod(itemOptions)
                },
                {
                    text: `£${item.item.totalItemCost}`
                },
                {
                    html: `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="submit" class="removeItem" value="Remove">
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
                                <input type="submit" class="removeItem" value="Remove">
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
}
