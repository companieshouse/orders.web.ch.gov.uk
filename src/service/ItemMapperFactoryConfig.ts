import {ItemMapperFactory} from "../service/ItemMapperFactory";
import {OtherCertificateItemMapper} from "../service/OtherCertificateItemMapper";
import {CompanyType} from "../model/CompanyType";
import {ItemMapper} from "../service/ItemMapper";
import {LLPCertificateItemMapper} from "../service/LLPCertificateItemMapper";
import {LPCertificateItemMapper} from "../service/LPCertificateItemMapper";

type Config =  { llpCertificateOrdersEnabled: boolean, lpCertificateOrdersEnabled: boolean };

export class ItemMapperFactoryConfig {
    public constructor(private _config: Config) {
    }

    getInstance = () => {
        const typeSpecificItemMappers: [CompanyType,  () => ItemMapper][] = [];
        if (this._config.llpCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_LIABILITY_PARTNERSHIP, () => { return new LLPCertificateItemMapper() }]);
        }
        if (this._config.lpCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_PARTNERSHIP, () => { return new LPCertificateItemMapper() }]);
        }

        return new ItemMapperFactory(typeSpecificItemMappers, () => {return new OtherCertificateItemMapper()});
    }

    set config(value: Config) {
        this._config = value;
    }
}