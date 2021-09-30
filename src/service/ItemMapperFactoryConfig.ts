import {ItemMapperFactory} from "./ItemMapperFactory";
import {OtherCertificateItemMapper} from "./OtherCertificateItemMapper";
import {CompanyType} from "../model/CompanyType";
import {ItemMapper} from "./ItemMapper";
import {LLPCertificateItemMapper} from "./LLPCertificateItemMapper";
import {LPCertificateItemMapper} from "./LPCertificateItemMapper";
import {DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED, DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED} from "../config/config";

export class ItemMapperFactoryConfig {
    public constructor(private readonly dynamicLPCertificateOrdersEnabled, private readonly dynamicLLPCertificateOrdersEnabled) {
    }

    getInstance = () => {
        const typeSpecificItemMappers: [CompanyType,  () => ItemMapper][] = [];
        if (this.dynamicLLPCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_LIABILITY_PARTNERSHIP, () => { return new LLPCertificateItemMapper() }]);
        }
        if (this.dynamicLPCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_PARTNERSHIP, () => { return new LPCertificateItemMapper() }]);
        }

        return new ItemMapperFactory(typeSpecificItemMappers, () => {return new OtherCertificateItemMapper()});
    }
}

export const ITEM_MAPPER_FACTORY_CONFIG = new ItemMapperFactoryConfig(DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED, DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED);