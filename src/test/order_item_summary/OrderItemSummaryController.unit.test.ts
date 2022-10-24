import { expect } from "chai";
import sinon from "sinon";
import { OrderItemSummaryController } from "../../order_item_summary/OrderItemSummaryController";
import { OrderItemSummaryService } from "../../order_item_summary/OrderItemSummaryService";
import { OrderItemRequest } from "../../order_item_summary/OrderItemRequest";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { OrderItemView } from "../../order_item_summary/OrderItemView";
import { InternalServerError, NotFound, Unauthorized } from "http-errors";

const request: any = {
    params: {
        orderId: "ORD-123123-123123",
        itemId: "CRT-123123-123123"
    },
    session: {
        data: {
            [SessionKey.SignInInfo]: {
                [SignInInfoKeys.AccessToken]: {
                    [SignInInfoKeys.AccessToken]: "F00DFACE"
                }
            }
        }
    },
};

const sandbox = sinon.createSandbox();

describe("OrderItemSummaryController", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("viewSummary", () => {
        it("Renders an item summary", async () => {
            // given
            const viewModelData = {};
            const viewModel = {
                data: viewModelData,
                template: "template"
            } as OrderItemView;
            const service = new OrderItemSummaryService();
            const mockService = sandbox.mock(service);
            mockService.expects("getOrderItem")
                .once()
                .withArgs({
                    apiToken: "F00DFACE",
                    orderId: "ORD-123123-123123",
                    itemId: "CRT-123123-123123"
                } as OrderItemRequest)
                .returns(viewModel);
            const response: any = {
                render: sandbox.spy()
            }
            const nextFunction = sandbox.spy();
            const controller = new OrderItemSummaryController(service);

            // when
            await controller.viewSummary(request, response, nextFunction);

            // then
            expect(response.render).to.be.calledOnceWith("template", viewModelData);
            expect(nextFunction).to.not.be.called;
            mockService.verify();
        });

        it("Renders page not found error if order item not found", async () => {
            // given
            const service = new OrderItemSummaryService();
            const mockService = sandbox.mock(service);
            mockService.expects("getOrderItem")
                .once()
                .withArgs({
                    apiToken: "F00DFACE",
                    orderId: "ORD-123123-123123",
                    itemId: "CRT-123123-123123"
                } as OrderItemRequest)
                .throws(new NotFound());
            const response: any = {
                render: sandbox.spy()
            }
            const nextFunction = sandbox.spy();
            const controller = new OrderItemSummaryController(service);

            // when
            await controller.viewSummary(request, response, nextFunction);

            // then
            expect(response.render).to.not.be.called;
            expect(nextFunction).to.be.called;
            mockService.verify();
        });

        it("Renders page not found error if user not order item resource owner", async () => {
            // given
            const service = new OrderItemSummaryService();
            const mockService = sandbox.mock(service);
            mockService.expects("getOrderItem")
                .once()
                .withArgs({
                    apiToken: "F00DFACE",
                    orderId: "ORD-123123-123123",
                    itemId: "CRT-123123-123123"
                } as OrderItemRequest)
                .throws(new Unauthorized());
            const response: any = {
                render: sandbox.spy()
            }
            const nextFunction = sandbox.spy();
            const controller = new OrderItemSummaryController(service);

            // when
            await controller.viewSummary(request, response, nextFunction);

            // then
            expect(response.render).to.not.be.called;
            expect(nextFunction).to.be.called;
            mockService.verify();
        });

        it("Invokes next function in chain if error unhandled", async () => {
            // given
            const service = new OrderItemSummaryService();
            const expectedError = new InternalServerError();
            const mockService = sandbox.mock(service);
            mockService.expects("getOrderItem")
                .once()
                .withArgs({
                    apiToken: "F00DFACE",
                    orderId: "ORD-123123-123123",
                    itemId: "CRT-123123-123123"
                } as OrderItemRequest)
                .throws(expectedError);
            const response: any = {
                render: sandbox.spy()
            }
            const nextFunction = sandbox.spy();
            const controller = new OrderItemSummaryController(service);

            // when
            await controller.viewSummary(request, response, nextFunction);

            // then
            expect(response.render).to.not.be.called;
            expect(nextFunction).to.be.calledOnceWith(expectedError);
            mockService.verify();
        });
    });
});
