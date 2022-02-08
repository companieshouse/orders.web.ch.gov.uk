import { CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { expect } from "chai";
import { NullItemMapper } from "../../service/NullItemMapper";

describe("NullItemMapper unit tests", () => {

    const nullItemMapper = new NullItemMapper();

    describe("getOrdersDetailTable", () => {
        it("throws an error when rendering a table", () => {
            // given
            const item = {
                companyName: "ACME LTD",
                companyNumber: "12345678",
                itemOptions: {} as CertificateItemOptions
            };

            // when
            const execution = () => nullItemMapper.getOrdersDetailTable(item);

            // then
            expect(execution).to.throw("Mapper not found");
        });
    });
});
