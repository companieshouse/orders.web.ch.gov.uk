import { MissingImageDeliveryMapper } from "../../order_item_summary/MissingImageDeliveryMapper";
import sinon from "sinon";
import { mockMidOrderItemView, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";
import { OrderItemView } from "../../order_item_summary/OrderItemView";
import { expect } from "chai";
import { MapperRequest } from "../../order_item_summary/MapperRequest";
import { ORDER_ITEM_SUMMARY_MID } from "../../model/template.paths";
import { OrderItemMapper } from "../../order_item_summary/OrderItemMapper";

const sandbox = sinon.createSandbox();

describe("MissingImageDeliveryMapper", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("map", () => {
        it("Maps a mapper request for a missing image delivery item to a GovUkOrderItemSummaryView ", async () => {
            // given
            const mapper: OrderItemMapper = new MissingImageDeliveryMapper(new MapperRequest("ORD-123123-123123", mockMissingImageDeliveryItem));
            // when
            mapper.map();
            const actual: OrderItemView = mapper.getMappedOrder();
            // then
            expect(actual.data).to.deep.equal(mockMidOrderItemView);
            expect(actual.template).to.equal(ORDER_ITEM_SUMMARY_MID);
        });
    });
});
