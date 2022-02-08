import {ItemMapper} from "./ItemMapper";
import { CompanyStatus } from "../model/CompanyStatus";
import { CompanyType } from "../model/CompanyType";

export class ItemMapperFactory {
    private readonly factoryMap: Map<string, Map<string, () => ItemMapper>>;

    public constructor(typeSpecificItemMappers: [string,  Map<string, () => ItemMapper>][], private readonly defaultMapper: () => ItemMapper) {
        this.factoryMap = new Map<string, Map<string, () => ItemMapper>>(typeSpecificItemMappers);
    }

    getItemMapper = (companyType: CompanyType | string, companyStatus: CompanyStatus | string): ItemMapper => {
        const defaultMapping = "default";
        if (this.factoryMap.has(companyType)) {
            if (this.factoryMap.get(companyType)?.has(companyStatus)) {
                return (this.factoryMap.get(companyType)?.get(companyStatus) || this.defaultMapper)()
            } else {
                return (this.factoryMap.get(companyType)?.get(defaultMapping) || this.defaultMapper)()
            }
        } else {
            if (this.factoryMap.get(defaultMapping)?.has(companyStatus)) {
                return (this.factoryMap.get(defaultMapping)?.get(companyStatus) || this.defaultMapper)()
            } else {
                return (this.factoryMap.get(defaultMapping)?.get(defaultMapping) || this.defaultMapper)()
            }
        }
    }
}