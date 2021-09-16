import {ItemMapper} from "./ItemMapper";
import {CompanyType} from "../model/CompanyType";
import {LLPCertificateItemMapper} from "./LLPCertificateItemMapper";
import {OtherCertificateItemMapper} from "./OtherCertificateItemMapper";
import {LPCertificateItemMapper} from "./LPCertificateItemMapper";

export class ItemMapperFactory {
    getItemMapper = (companyType: CompanyType | string): ItemMapper => {
        let itemMapper: ItemMapper;
        switch (companyType) {
            case CompanyType.LIMITED_LIABILITY_PARTNERSHIP: {
                itemMapper = new LLPCertificateItemMapper();
                break;
            }
            case CompanyType.LIMITED_PARTNERSHIP: {
                itemMapper = new LPCertificateItemMapper();
                break;
            }
            default: {
                // Handle Ltd company and all other company types
                itemMapper = new OtherCertificateItemMapper();
                break;
            }
        }
        return itemMapper;
    }
}