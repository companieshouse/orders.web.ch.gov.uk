import sinon from "sinon";
import {
    mockCertCopyOrderItemView,
    mockCertifiedCopyItem
} from "../__mocks__/order.mocks";
import { OrderItemView } from "../../order_item_summary/OrderItemView";
import { expect } from "chai";
import { CertifiedCopyMapper } from "../../order_item_summary/CertifiedCopyMapper";
import { OrderItemMapper } from "../../order_item_summary/OrderItemMapper";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { ORDER_ITEM_SUMMARY_CERTIFIED_COPY } from "../../model/template.paths";
import { MapperRequest } from "../../mappers/MapperRequest";

const sandbox = sinon.createSandbox();

describe("CertifiedCopyMapper", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("map", () => {
        it("Maps a mapper request for a certified copy item to a GovUkOrderItemSummaryView ", async () => {
            // given
            const mockItem: Item = {
                ...mockCertifiedCopyItem,
                itemOptions: {
                    ...mockCertifiedCopyItem.itemOptions,
                    filingHistoryDocuments: [{
                        filingHistoryDate: "2010-02-12",
                        filingHistoryDescription: "change-person-director-company-with-change-date",
                        filingHistoryDescriptionValues: {
                            change_date: "2010-02-12",
                            officer_name: "Thomas David Wheare"
                        },
                        filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                        filingHistoryType: "CH01",
                        filingHistoryCost: "15"
                    }]
                },
                totalItemCost: "15"
            };
            const mapper: OrderItemMapper = new CertifiedCopyMapper(new MapperRequest("ORD-123123-123123", mockItem));
            // when
            mapper.map();
            const actual: OrderItemView = mapper.getMappedOrder();
            // then
            expect(actual.data).to.deep.equal(mockCertCopyOrderItemView);
            expect(actual.template).to.equal(ORDER_ITEM_SUMMARY_CERTIFIED_COPY);
        });
    });
});
