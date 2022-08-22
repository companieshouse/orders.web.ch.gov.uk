import sinon from "sinon";
import { OrderItemMapper } from "../../order_item_summary/OrderItemMapper";
import { OrderItemSummaryFactory } from "../../order_item_summary/OrderItemSummaryFactory";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { mockCertificateItem, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";
import { expect } from "chai";
import { MissingImageDeliveryMapper } from "../../order_item_summary/MissingImageDeliveryMapper";
import { NullOrderItemMapper } from "../../order_item_summary/NullOrderItemMapper";
import { MapperRequest } from "../../mappers/MapperRequest";

const sandbox = sinon.createSandbox();

describe("OrderItemSummaryFactory", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("getMapper", () => {
        it("Returns a missing image delivery mapper for missing image delivery item kind", async () => {
            // given
            const factory = new OrderItemSummaryFactory();
            // when
            const mapper: OrderItemMapper = factory.getMapper(new MapperRequest("ORD-123123-123123", mockMissingImageDeliveryItem));
            // then
            expect(mapper).be.an.instanceOf(MissingImageDeliveryMapper);
        });

        it("Returns a null item mapper for unknown item kind", async () => {
            // given
            const factory = new OrderItemSummaryFactory();
            const unknownCert: Item = {
                ...mockCertificateItem,
                kind: "unknown"
            };
            // when
            const mapper: OrderItemMapper = factory.getMapper(new MapperRequest("ORD-123123-123123", unknownCert));
            // then
            expect(mapper).be.an.instanceOf(NullOrderItemMapper);
        });
    });
});
