import {ItemMapper} from "./ItemMapper";
import {CompanyType} from "../model/CompanyType";
import {LLPCertificateItemMapper} from "./LLPCertificateItemMapper";
import {OtherCertificateItemMapper} from "./OtherCertificateItemMapper";
import {LPCertificateItemMapper} from "./LPCertificateItemMapper";

export class ItemMapperFactory {
    private readonly factoryMap = new Map<string, () => ItemMapper>([
        [CompanyType.LIMITED_PARTNERSHIP, () => { return new LPCertificateItemMapper() }],
        [CompanyType.LIMITED_LIABILITY_PARTNERSHIP, () => { return new LLPCertificateItemMapper() }]
    ]);

    getItemMapper = (companyType: CompanyType | string): ItemMapper => {
        return (this.factoryMap.get(companyType) || (() => { return new OtherCertificateItemMapper() }))();
    }
}