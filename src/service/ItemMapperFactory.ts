import {ItemMapper} from "./ItemMapper";
import {CompanyType} from "../model/CompanyType";

export class ItemMapperFactory {
    private readonly factoryMap: Map<string, () => ItemMapper>;

    public constructor(typeSpecificItemMappers: [CompanyType,  () => ItemMapper][], private readonly defaultItemMapper: () => ItemMapper) {
        this.factoryMap = new Map<CompanyType, () => ItemMapper>(typeSpecificItemMappers);
    }

    getItemMapper = (companyType: CompanyType | string): ItemMapper => {
        return (this.factoryMap.get(companyType) || this.defaultItemMapper)();
    }
}