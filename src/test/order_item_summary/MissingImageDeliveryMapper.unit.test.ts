import { MissingImageDeliveryMapper } from "../../order_item_summary/MissingImageDeliveryMapper";
import sinon from "sinon";
import { mockMidOrderItemView, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";
import { OrderItemView } from "../../order_item_summary/OrderItemView";
import { expect } from "chai";
import { MapperRequest } from "../../mappers/MapperRequest";
import { ORDER_ITEM_SUMMARY_MID } from "../../model/template.paths";

const sandbox = sinon.createSandbox();

describe("MissingImageDeliveryMapper", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("map", () => {
        it("Maps a mapper request for a missing image delivery item to a GovUkOrderItemSummaryView ", async () => {
            // given
            const mapper: MissingImageDeliveryMapper = new MissingImageDeliveryMapper(new MapperRequest("ORD-123123-123123", mockMissingImageDeliveryItem));
            // when
            mapper.map();
            const actual: OrderItemView = mapper.getMappedOrder();
            // then
            expect(actual.data).to.deep.equal(mockMidOrderItemView);
            expect(actual.template).to.equal(ORDER_ITEM_SUMMARY_MID);
        });
    });
});
