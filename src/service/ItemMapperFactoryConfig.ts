import {ItemMapperFactory} from "./ItemMapperFactory";
import {OtherCertificateItemMapper} from "./OtherCertificateItemMapper";
import {CompanyType} from "../model/CompanyType";
import {ItemMapper} from "./ItemMapper";
import {LLPCertificateItemMapper} from "./LLPCertificateItemMapper";
import {LPCertificateItemMapper} from "./LPCertificateItemMapper";
import {FEATURE_FLAGS, FeatureFlags} from "../config/FeatureFlags";

export class ItemMapperFactoryConfig {
    public constructor(private readonly featureFlags: FeatureFlags) {
    }

    getInstance = () => {
        const typeSpecificItemMappers: [CompanyType, () => ItemMapper][] = [];
        if (this.featureFlags.llpCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_LIABILITY_PARTNERSHIP, () => {
                return new LLPCertificateItemMapper()
            }]);
        }
        if (this.featureFlags.lpCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_PARTNERSHIP, () => {
                return new LPCertificateItemMapper()
            }]);
        }

        return new ItemMapperFactory(typeSpecificItemMappers, () => {
            return new OtherCertificateItemMapper()
        });
    }
}

export const ITEM_MAPPER_FACTORY_CONFIG = new ItemMapperFactoryConfig(FEATURE_FLAGS);