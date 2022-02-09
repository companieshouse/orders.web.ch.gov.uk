import { ItemMapper } from "./ItemMapper";
import { CompanyType } from "../model/CompanyType";
import { CompanyStatus } from "../model/CompanyStatus";

export type CompanyDetail = { companyType: CompanyType | string, companyStatus: CompanyStatus | string };

export class ItemMapperFactory {
    private readonly factoryMap: Map<string, Map<string, () => ItemMapper>>;
    static defaultMapping = "default";

    public constructor (typeSpecificItemMappers: [string, Map<string, () => ItemMapper>][], private readonly defaultMapper: () => ItemMapper) {
        this.factoryMap = new Map<string, Map<string, () => ItemMapper>>(typeSpecificItemMappers);
    }

    getItemMapper = (item: CompanyDetail): ItemMapper => {
        let typeMappings: Map<string, () => ItemMapper>;
        if (this.factoryMap.has(item.companyType)) {
            typeMappings = this.factoryMap?.get(item.companyType) || new Map<string, () => ItemMapper>();
        } else {
            typeMappings = this.factoryMap?.get(ItemMapperFactory.defaultMapping) || new Map<string, () => ItemMapper>();
        }
        if (typeMappings.has(item.companyStatus)) {
            return (typeMappings?.get(item.companyStatus) || this.defaultMapper)();
        } else {
            return (typeMappings?.get(ItemMapperFactory.defaultMapping) || this.defaultMapper)();
        }
    };
}
