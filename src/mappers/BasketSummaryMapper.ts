import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { MapUtil } from "../service/MapUtil";
import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import {
    ItemOptions as CertifiedCopyItemOptions
} from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { mapFilingHistoriesDocuments } from "../service/map.item.service";
import { ItemOptions as MissingImageDeliveryItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/mid";

export type BasketSummaryViewModel = {
    certificates: any[][]
    certifiedCopies: any[][],
    missingImageDelivery: any[][],
    totalItemCost: number,
    deliveryDetailsTable: any,
    hasDeliverableItems: boolean,
    serviceName: string,
}

export class BasketSummaryMapper {
    // eslint-disable-next-line no-useless-constructor
    constructor (private readonly viewModel: BasketSummaryViewModel, private readonly item: Item, private readonly deliveryDetails?: DeliveryDetails) {
    }

    mapCertificateToViewModel () {
        const itemOptions = this.item.itemOptions as CertificateItemOptions;
        this.viewModel.certificates.push([
            {
                text: MapUtil.mapCertificateType(itemOptions?.certificateType)
            },
            {
                text: this.item.companyNumber
            },
            {
                text: MapUtil.mapDeliveryMethod(itemOptions)
            },
            {
                text: `£${this.item.totalItemCost}`
            },
            {
                html: `<a class="govuk-link" href="javascript:void(0)">View/Change certificate options</a>`
            },
            {
                html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
            }
        ]);
        this.viewModel.hasDeliverableItems = true;
        if (!this.viewModel.deliveryDetailsTable && this.deliveryDetails) {
            this.viewModel.deliveryDetailsTable = MapUtil.getDeliveryDetailsTable(this.deliveryDetails);
        }
    }

    mapCertifiedCopyToViewModel () {
        const itemOptions = this.item.itemOptions as CertifiedCopyItemOptions;
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
                text: this.item.companyNumber
            },
            {
                text: MapUtil.mapDeliveryMethod(itemOptions)
            },
            {
                text: `£${this.item.totalItemCost}`
            },
            {
                html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
            }
        ]);
        this.viewModel.hasDeliverableItems = true;
        if (!this.viewModel.deliveryDetailsTable && this.deliveryDetails) {
            this.viewModel.deliveryDetailsTable = MapUtil.getDeliveryDetailsTable(this.deliveryDetails);
        }
    }

    mapMissingImageToViewModel () {
        const itemOptions = this.item.itemOptions as MissingImageDeliveryItemOptions;
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
                text: this.item.companyNumber
            },
            {
                text: `£${this.item.totalItemCost}`
            },
            {
                html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
            }
        ]);
    }
}
