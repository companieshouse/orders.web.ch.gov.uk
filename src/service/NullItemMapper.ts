import { CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { ItemMapper } from "./ItemMapper";

export class NullItemMapper extends ItemMapper {
    getOrdersDetailTable (item: { companyName: string; companyNumber: string; itemOptions: CertificateItemOptions; }) {
        throw new Error("Mapper not found");
    }
}
