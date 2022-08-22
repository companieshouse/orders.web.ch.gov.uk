import sinon from "sinon";
import * as apiClient from "../../client/api.client";
import { mockCertificateItem } from "../__mocks__/order.mocks";
import { OrderItemSummaryService } from "../../order_item_summary/OrderItemSummaryService";
import { expect } from "chai";
import { InternalServerError } from "http-errors";
import { MapperRequest } from "../../order_item_summary/MapperRequest";

const sandbox = sinon.createSandbox();

describe("OrderItemSummaryService", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });
    describe("getOrderItem", () => {
        it("Returns a mapped order item", async () => {
            // given
            sandbox.stub(apiClient, "getOrderItem")
                .returns(Promise.resolve(mockCertificateItem));
            const mappedOrder = {};
            const mapper = {
                map: sandbox.spy(),
                getMappedOrder: sandbox.stub().returns(mappedOrder)
            };
            const factory = {
                getMapper: sandbox.stub().returns(mapper)
            };
            const service = new OrderItemSummaryService(factory);

            // when
            const actual = await service.getOrderItem({
                apiToken: "F00DFACE",
                orderId: "ORD-123456-123456",
                itemId: "MID-123456-123456"
            });

            // then
            expect(actual).to.equal(mappedOrder);
            expect(apiClient.getOrderItem).to.be.calledOnceWith("ORD-123456-123456", "MID-123456-123456");
            expect(mapper.map).to.be.calledOnce;
            expect(mapper.getMappedOrder).to.be.calledOnce;
            expect(factory.getMapper).to.be.calledOnceWith(new MapperRequest("ORD-123456-123456", mockCertificateItem));
        });

        it("Propagates exception thrown by API client", async () => {
            // given
            const expectedError = new InternalServerError();
            sandbox.stub(apiClient, "getOrderItem")
                .throws(expectedError);
            const mappedOrder = {};
            const mapper = {
                map: sandbox.spy(),
                getMappedOrder: sandbox.stub().returns(mappedOrder)
            };
            const factory = {
                getMapper: sandbox.stub().returns(mapper)
            };
            const service = new OrderItemSummaryService(factory);

            await expect(service.getOrderItem({
                apiToken: "F00DFACE",
                orderId: "ORD-123456-123456",
                itemId: "MID-123456-123456"
            })).to.be.rejectedWith(expectedError);
            expect(apiClient.getOrderItem).to.be.calledOnceWith("ORD-123456-123456", "MID-123456-123456");
            expect(mapper.getMappedOrder).to.not.be.called;
            expect(mapper.map).to.not.be.called;
            expect(factory.getMapper).to.not.be.called;
        });
    });
});
