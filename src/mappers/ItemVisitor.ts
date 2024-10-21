import { VisitableItem } from "./VisitableItem";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { MapUtil } from "../service/MapUtil";
import { ItemOptions as CertifiedCopyItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { mapFilingHistoriesDocuments } from "../service/map.item.service";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";
import { BasketDetailsViewModel } from "./BasketDetailsViewModel";

export class ItemVisitor {
    constructor(private viewModel: BasketDetailsViewModel, private csrfToken: string) {
    }

    visit (item: VisitableItem) {
        if (item.item.kind === "item#certificate") {
            const itemOptions = item.item.itemOptions as CertificateItemOptions;
            this.setDeliveryMethodHelptext(itemOptions);
            this.viewModel.certificates.push([
                {
                    html: ItemVisitor.makeCellResponsive(
                        "Certificate type", MapUtil.mapCertificateType(itemOptions?.certificateType))
                },
                {
                    html: ItemVisitor.makeCellResponsive("Company number", item.item.companyNumber)
                },
                {
                    html: ItemVisitor.makeCellResponsive(
                        "Dispatch method", MapUtil.mapBasketDeliveryMethod(itemOptions))
                },
                {
                    html: ItemVisitor.makeCellResponsive("Quantity", `${item.item.quantity}`)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Fee", `£${item.item.totalItemCost}`)
                },
                {
                    html: ItemVisitor.makeCellResponsive(
                        null,
                        `<a class="govuk-link"
                              data-event-id="view-change-certificate-options"
                              href="${this.getViewChangeCertOptionsLink(item.item.id, itemOptions.companyType)}">
                              View/Change certificate options
                              <span class="govuk-visually-hidden">
                                  ${MapUtil.mapCertificateType(itemOptions?.certificateType)} for ${item.item.companyNumber}
                              </span>
                           </a>`)
                },
                {
                    html: ItemVisitor.makeCellResponsive(
                        null,
                        `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="hidden" name="_csrf" value="${this.csrfToken}">
                                <input type="submit"
                                       class="removeItem"
                                       data-event-id="remove-item"
                                       value="Remove"
                                       aria-label="Remove ${MapUtil.mapCertificateType(itemOptions?.certificateType)} certificate for ${item.item.companyNumber}">
                         </form>`)
                }
            ]);
        } else if (item.item.kind === "item#certified-copy") {
            const itemOptions = item.item.itemOptions as CertifiedCopyItemOptions;
            const mappedFilingHistory = mapFilingHistoriesDocuments(itemOptions?.filingHistoryDocuments || []);
            this.setDeliveryMethodHelptext(itemOptions);
            this.viewModel.certifiedCopies.push([
                {
                    html: ItemVisitor.makeCellResponsive("Date Filed", mappedFilingHistory[0]?.filingHistoryDate)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Type", mappedFilingHistory[0]?.filingHistoryType)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Description", mappedFilingHistory[0]?.filingHistoryDescription)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Company Number", item.item.companyNumber)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Dispatch method", MapUtil.mapBasketDeliveryMethod(itemOptions))
                },
                {
                    html: ItemVisitor.makeCellResponsive("Fee", `£${item.item.totalItemCost}`)
                },
                {
                    html: ItemVisitor.makeCellResponsive(
                        null,
                        `<form action="/basket/remove/${item.item.id}" method="post">
                                <input type="hidden" name="_csrf" value="${this.csrfToken}">
                                <input type="submit"
                                       class="removeItem"
                                       data-event-id="remove-item"
                                       value="Remove"
                                       aria-label="Remove Certified Document ${mappedFilingHistory[0]?.filingHistoryDescription} for ${item.item.companyNumber}">
                            </form>`)
                }
            ]);
        } else if (item.item.kind === "item#missing-image-delivery") {
            const itemOptions = item.item.itemOptions as MissingImageDeliveryItemOptions;
            const mappedFilingHistory = mapFilingHistoriesDocuments([itemOptions]);
            this.viewModel.missingImageDelivery.push([
                {
                    html: ItemVisitor.makeCellResponsive("Date Filed", mappedFilingHistory[0]?.filingHistoryDate)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Type", mappedFilingHistory[0]?.filingHistoryType)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Description", mappedFilingHistory[0]?.filingHistoryDescription)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Company Number", item.item.companyNumber)
                },
                {
                    html: ItemVisitor.makeCellResponsive("Fee", `£${item.item.totalItemCost}`)
                },
                {
                    html: ItemVisitor.makeCellResponsive(
                        null,
                        `<form action="/basket/remove/${item.item.id}" method="post">
                            <input type="hidden" name="_csrf" value="${this.csrfToken}">
                            <input type="submit"
                                   class="removeItem"
                                   data-event-id="remove-item"
                                   value="Remove"
                                   aria-label="Remove Missing Image Delivery ${mappedFilingHistory[0]?.filingHistoryDescription} for ${item.item.companyNumber}">
                         </form>`)
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

    static makeCellResponsive (fieldHeading: string | null, fieldValue: string | undefined | null) : string {
        fieldHeading = fieldHeading === null
            ? "" : `<span class="responsive-table__heading" aria-hidden="false">${fieldHeading}</span>`;
        fieldValue = fieldValue === undefined || fieldValue === null ? "" : fieldValue;
        return fieldHeading + `<span class="responsive-table__cell" aria-hidden="false">${fieldValue}</span>`;
    }
}
