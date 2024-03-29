import { LPCertificateMapper } from "../../order_item_summary/LPCertificateMapper";
import { mockActiveLPCertificateItemView, mockCertificateItem, ORDER_ID } from "../__mocks__/order.mocks";
import { expect } from "chai";
import { ORDER_ITEM_SUMMARY_CERTIFICATE } from "../../model/template.paths";

describe("LPCertificateMapper", () => {
    describe("map", () => {
       it("Maps an active limited partnership", () => {
           // given
           const mapper = new LPCertificateMapper({
               orderId: ORDER_ID,
               item: {
                   ...mockCertificateItem,
                   itemOptions: {
                       ...mockCertificateItem.itemOptions,
                       companyType: "limited-partnership",
                       principalPlaceOfBusinessDetails: {
                           includeAddressRecordsType: "current-and-previous"
                       },
                       limitedPartnerDetails: {
                           includeBasicInformation: true
                       },
                       generalPartnerDetails: {
                           includeBasicInformation: true
                       },
                       includeGeneralNatureOfBusinessInformation: true
                   }
               }
           });

           // when
           mapper.map();
           const actual = mapper.getMappedOrder();

           // then
           expect(actual).to.deep.equal({
               template: ORDER_ITEM_SUMMARY_CERTIFICATE,
               data: mockActiveLPCertificateItemView
           });
       });
    });
});
