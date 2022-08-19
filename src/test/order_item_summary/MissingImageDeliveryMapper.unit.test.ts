import { MissingImageDeliveryMapper } from "../../order_item_summary/MissingImageDeliveryMapper";
import sinon from "sinon";
import { mockMidOrderItemView, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";
import { OrderItemView } from "../../order_item_summary/OrderItemView";
import { expect } from "chai";

const sandbox = sinon.createSandbox();

describe("MissingImageDeliveryMapper", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("map", () => {
        it("Maps a missing image delivery item to an ", async () => {
            // given
            const mapper: MissingImageDeliveryMapper = new MissingImageDeliveryMapper(mockMissingImageDeliveryItem);
            // when
            mapper.map("ORD-123123-123123");
            const actual: OrderItemView = mapper.getMappedOrder();
            // then
            expect(actual.data).to.deep.equal(mockMidOrderItemView);
            expect(actual.template).to.equal("order-item-summary-mid.html");
        });
    });
});
