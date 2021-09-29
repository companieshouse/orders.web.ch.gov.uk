import {ItemMapper} from "./ItemMapper";
import {CompanyType} from "../model/CompanyType";
import {LLPCertificateItemMapper} from "./LLPCertificateItemMapper";
import {OtherCertificateItemMapper} from "./OtherCertificateItemMapper";
import {LPCertificateItemMapper} from "./LPCertificateItemMapper";
import { ITEM_MAPPER_FACTORY_CONFIG } from "../config/config";
import { ItemMapperFactoryConfig } from "./ItemMapperFactoryConfig";

export class ItemMapperFactory {
    private readonly factoryMap: Map<string, () => ItemMapper>;

    public constructor(itemMapperFactoryConfig : ItemMapperFactoryConfig = ITEM_MAPPER_FACTORY_CONFIG) {

        this.factoryMap = new Map<string, () => ItemMapper>();
        if ("true" === itemMapperFactoryConfig.config.llpCertificateOrdersEnabled) {
            this.factoryMap.set(CompanyType.LIMITED_LIABILITY_PARTNERSHIP, () => { return new LLPCertificateItemMapper() })
        }
        if ("true" === itemMapperFactoryConfig.config.lpCertificateOrdersEnabled) {
            this.factoryMap.set(CompanyType.LIMITED_PARTNERSHIP, () => { return new LPCertificateItemMapper() })
        }
    }
    
    getItemMapper = (companyType: CompanyType | string): ItemMapper => {
        return (this.factoryMap.get(companyType) || (() => { return new OtherCertificateItemMapper() }))();
    }
}