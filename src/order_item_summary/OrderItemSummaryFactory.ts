import { OrderItemMapper } from "./OrderItemMapper";
import { MissingImageDeliveryMapper } from "./MissingImageDeliveryMapper";
import { NullOrderItemMapper } from "./NullOrderItemMapper";
import { MapperRequest } from "../mappers/MapperRequest";
import { CertifiedCopyMapper } from "./CertifiedCopyMapper";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { CompanyType } from "../model/CompanyType";
import { OtherCompanyTypesCertificateMapper } from "./OtherCompanyTypesCertificateMapper";

export class OrderItemSummaryFactory {
    getMapper (mapperRequest: MapperRequest): OrderItemMapper {
        if (mapperRequest.item.kind === "item#certificate") {
            const itemOptions = mapperRequest.item.itemOptions as CertificateItemOptions;
            if (itemOptions.companyType !== CompanyType.LIMITED_LIABILITY_PARTNERSHIP && itemOptions.companyType !== CompanyType.LIMITED_PARTNERSHIP) {
                return new OtherCompanyTypesCertificateMapper(mapperRequest);
            } else {
                return new NullOrderItemMapper();
            }
        } else if (mapperRequest.item.kind === "item#certified-copy") {
            return new CertifiedCopyMapper(mapperRequest);
        } else if (mapperRequest.item.kind === "item#missing-image-delivery") {
            return new MissingImageDeliveryMapper(mapperRequest);
        } else {
            return new NullOrderItemMapper();
        }
    }
}
