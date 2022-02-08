import { ItemMapperFactory } from "./ItemMapperFactory";
import { OtherCertificateItemMapper } from "./OtherCertificateItemMapper";
import { CompanyType } from "../model/CompanyType";
import { ItemMapper } from "./ItemMapper";
import { LLPCertificateItemMapper } from "./LLPCertificateItemMapper";
import { LPCertificateItemMapper } from "./LPCertificateItemMapper";
import { FEATURE_FLAGS, FeatureFlags } from "../config/FeatureFlags";
import { CompanyStatus } from "../model/CompanyStatus";
import { LiquidatedOtherCertificateItemMapper } from "./LiquidatedOtherCertificateItemMapper";
import { NullItemMapper } from "./NullItemMapper";
import { LiquidatedLLPCertificateItemMapper } from "./LiquidatedLLPCertificateItemMapper";

export class ItemMapperFactoryConfig {
    public constructor (private readonly featureFlags: FeatureFlags) {
    }

    getInstance = () => {
        const typeSpecificItemMappers: [string, Map<string, () => ItemMapper>][] = [];
        if (this.featureFlags.llpCertificateOrdersEnabled) {
            this.setupLLPItemMappers(typeSpecificItemMappers);
        }
        if (this.featureFlags.lpCertificateOrdersEnabled) {
            this.setupLPItemMappers(typeSpecificItemMappers);
        }
        this.setupDefaultItemMappers(typeSpecificItemMappers);
        return new ItemMapperFactory(typeSpecificItemMappers, () => {
            return new NullItemMapper();
        });
    };

    private setupLLPItemMappers (typeSpecificItemMappers: [string, Map<string, () => ItemMapper>][]) {
        const llpMappers: [string, () => ItemMapper][] = [
            [ItemMapperFactory.defaultMapping, () => new LLPCertificateItemMapper()]
        ];
        if (this.featureFlags.liquidationEnabled) {
            llpMappers.push([CompanyStatus.LIQUIDATION, () => new LiquidatedLLPCertificateItemMapper()]);
        }
        typeSpecificItemMappers.push([CompanyType.LIMITED_LIABILITY_PARTNERSHIP, new Map<string, () => ItemMapper>(llpMappers)]);
    }

    private setupLPItemMappers (typeSpecificItemMappers: [string, Map<string, () => ItemMapper>][]) {
        typeSpecificItemMappers.push([CompanyType.LIMITED_PARTNERSHIP, new Map<string, () => ItemMapper>([
            [ItemMapperFactory.defaultMapping, () => {
                return new LPCertificateItemMapper();
            }]
        ])]);
    }

    private setupDefaultItemMappers (typeSpecificItemMappers: [string, Map<string, () => ItemMapper>][]) {
        const defaultMappers: [string, () => ItemMapper][] = [
            [ItemMapperFactory.defaultMapping, () => new OtherCertificateItemMapper()]
        ];
        if (this.featureFlags.liquidationEnabled) {
            defaultMappers.push([CompanyStatus.LIQUIDATION, () => new LiquidatedOtherCertificateItemMapper()]);
        }
        typeSpecificItemMappers.push([ItemMapperFactory.defaultMapping, new Map<string, () => ItemMapper>(defaultMappers)]);
    }
}

export const ITEM_MAPPER_FACTORY_CONFIG = new ItemMapperFactoryConfig(FEATURE_FLAGS);
