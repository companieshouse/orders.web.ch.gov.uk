import {ItemMapperFactory} from "./ItemMapperFactory";
import {OtherCertificateItemMapper} from "./OtherCertificateItemMapper";
import {CompanyType} from "../model/CompanyType";
import {ItemMapper} from "./ItemMapper";
import {LLPCertificateItemMapper} from "./LLPCertificateItemMapper";
import {LPCertificateItemMapper} from "./LPCertificateItemMapper";
import {FEATURE_FLAGS, FeatureFlags} from "../config/FeatureFlags";
import { CompanyStatus } from "../model/CompanyStatus";
import { LiquidatedOtherCertificateItemMapper } from "./LiquidatedOtherCertificateItemMapper";
import { NullItemMapper } from "./NullItemMapper";

export class ItemMapperFactoryConfig {
    public constructor(private readonly featureFlags: FeatureFlags) {
    }

    getInstance = () => {
        const typeSpecificItemMappers: [string, Map<string, () => ItemMapper>][] = [];
        if (this.featureFlags.llpCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_LIABILITY_PARTNERSHIP, new Map<string, () => ItemMapper>([
                ["default", () => {return new LLPCertificateItemMapper()}]
            ])]);
        }
        if (this.featureFlags.lpCertificateOrdersEnabled) {
            typeSpecificItemMappers.push([CompanyType.LIMITED_PARTNERSHIP, new Map<string, () => ItemMapper>([
                ["default", () => {return new LPCertificateItemMapper()}]
            ])]);
        }
        typeSpecificItemMappers.push(["default", new Map<string, () => ItemMapper>([
            [CompanyStatus.LIQUIDATION, () => {return new LiquidatedOtherCertificateItemMapper()}],
            ["default", () => {return new OtherCertificateItemMapper()}]
        ])]);

        return new ItemMapperFactory(typeSpecificItemMappers, () => {
            return new NullItemMapper()
        });
    }
}

export const ITEM_MAPPER_FACTORY_CONFIG = new ItemMapperFactoryConfig(FEATURE_FLAGS);