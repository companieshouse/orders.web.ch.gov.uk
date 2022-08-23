import sinon from "sinon";
import { OrderItemMapper } from "../../order_item_summary/OrderItemMapper";
import { OrderItemSummaryFactory } from "../../order_item_summary/OrderItemSummaryFactory";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem } from "../__mocks__/order.mocks";
import { expect } from "chai";
import { MissingImageDeliveryMapper } from "../../order_item_summary/MissingImageDeliveryMapper";
import { NullOrderItemMapper } from "../../order_item_summary/NullOrderItemMapper";
import { MapperRequest } from "../../mappers/MapperRequest";
import { CertifiedCopyMapper } from "../../order_item_summary/CertifiedCopyMapper";
import { OtherCompanyTypesCertificateMapper } from "../../order_item_summary/OtherCompanyTypesCertificateMapper";

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

        it("Returns a certified copy mapper for certified copy item kind", async () => {
            // given
            const factory = new OrderItemSummaryFactory();
            // when
            const mapper: OrderItemMapper = factory.getMapper(new MapperRequest("ORD-123123-123123", mockCertifiedCopyItem));
            // then
            expect(mapper).be.an.instanceOf(CertifiedCopyMapper);
        });

        it("Returns a certified copy mapper for certificate item kind for other company types", async () => {
            // given
            const factory = new OrderItemSummaryFactory();
            // when
            const mapper: OrderItemMapper = factory.getMapper(new MapperRequest("ORD-123123-123123", mockCertificateItem));
            // then
            expect(mapper).be.an.instanceOf(OtherCompanyTypesCertificateMapper);
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
