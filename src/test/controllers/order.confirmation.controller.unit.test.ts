import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order";
import chai, { expect } from "chai";

import { getItemTypeUrlParam, getItemTypesUrlParam, getRedirectUrl } from "../../controllers/order.confirmation.controller";
import { mockCertificateItem, mockCertifiedCopyItem, mockMissingImageDeliveryItem, mockDissolvedCertificateItem} from "../__mocks__/order.mocks";

describe("order.confirmation.controller.unit", () => {
    describe("getItemTypeUrlParam", () => {
        it("get itemType for certificate correctly", () => {
            const result = getItemTypeUrlParam(mockCertificateItem);
            chai.expect(result).to.equal("itemType=certificate");
        });

        it("get itemType for dissolved certificate correctly", () => {
            const result = getItemTypeUrlParam(mockDissolvedCertificateItem);
            chai.expect(result).to.equal("itemType=dissolved-certificate");
        });

        it("get itemType for certified-copies correctly", () => {
            const result = getItemTypeUrlParam(mockCertifiedCopyItem);
            chai.expect(result).to.equal("itemType=certified-copy");
        });

        it("get itemType for missing-image-delivery correctly", () => {
            const result = getItemTypeUrlParam(mockMissingImageDeliveryItem);
            chai.expect(result).to.equal("itemType=missing-image-delivery");
        });
    });

    describe("getItemTypesUrlParam", () => {
        it("should return the correct URL parameter for a single certificate item", () => {
            const items = [{ ...mockCertificateItem }];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=1");
        });
    
        it("should return the correct URL parameter for a single certified copy item", () => {
            const items = [{ ...mockCertifiedCopyItem }];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=2");
        });
    
        it("should return the correct URL parameter for a single missing image delivery item", () => {
            const items = [{ ...mockMissingImageDeliveryItem }];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=3");
        });
    
        it("should return the correct URL parameter for a single dissolution item (sub type of Certificate)", () => {
            const items = [{ ...mockDissolvedCertificateItem }];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=4");
        });

        it("should handle multiple items of the same type without duplicates", () => {
            const items = [
                {...mockCertificateItem},
                {...mockCertificateItem},
            ];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=1");
        });
    
        it("should handle multiple items of different types", () => {
            const items = [
                {...mockCertifiedCopyItem},
                {...mockCertificateItem},
                {...mockDissolvedCertificateItem},
                {...mockMissingImageDeliveryItem}
            ];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=1,2,3,4");
        });
    
        it("should handle multiple items with duplicates and sort the result", () => {
            const items = [
                {...mockCertificateItem},
                {...mockCertificateItem},
                {...mockCertifiedCopyItem},
                {...mockMissingImageDeliveryItem},
                {...mockMissingImageDeliveryItem},
                {...mockDissolvedCertificateItem},
                {...mockDissolvedCertificateItem},
            ];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=1,2,3,4");
        });
    
        it("should handle a mix of normal and dissolution certificates", () => {
            const items = [
                {...mockCertificateItem},
                {...mockDissolvedCertificateItem}
            ];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=1,4");
        });
    
        it("should return an empty string if there are no items", () => {
            const items = [];
            const result = getItemTypesUrlParam(items);
            expect(result).to.equal("itemTypes=");
        });
    });

    describe("getRedirectUrl", () => {
        it("return a redirect url correctly", () => {
            const basketItem = {
                items: [{
                    itemUri: "/o",
                    kind: "item#certified-copies",
                    links: { self: "item#certified-copy" },
                    itemId: "CRT-123456-123456"
                }]
            } as unknown as BasketItem;

            const result = getRedirectUrl(basketItem, "itemId");
            chai.expect(result).to.contain("/check-details");
        });
    });

    it("return a redirect url for a dissolution correctly", () => {
        const basketItem = {
            items: [{
                itemOptions: {
                    certificateType: "dissolution"
                },
                itemUri: "/orderable/certificates",
                kind: "item#certificate",
                links: { self: "item#certificate" },
                itemId: "CRT-123456-123456"
            }]
        } as unknown as BasketItem;

        const result = getRedirectUrl(basketItem, "itemId");
        chai.expect(result).to.contain("/check-details");
    });

      
});
