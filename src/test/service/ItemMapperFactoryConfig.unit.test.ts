import {ItemMapperFactoryConfig} from "../../service/ItemMapperFactoryConfig";
import {expect} from "chai";
import {CompanyType} from "../../model/CompanyType";
import {OtherCertificateItemMapper} from "../../service/OtherCertificateItemMapper";
import {LLPCertificateItemMapper} from "../../service/LLPCertificateItemMapper";
import {LPCertificateItemMapper} from "../../service/LPCertificateItemMapper";
import {FeatureFlags} from "../../config/FeatureFlags";
import { CompanyStatus } from "../../model/CompanyStatus";
import { LiquidatedOtherCertificateItemMapper } from "../../service/LiquidatedOtherCertificateItemMapper";
import { LiquidatedLLPCertificateItemMapper } from "../../service/LiquidatedLLPCertificateItemMapper";


describe("ItemMapperFactoryConfig unit tests", ()=>{
    it("correctly returns item mappers when LP, LLP and liquidation feature flags are false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, false, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LP & LLP feature flags are false and liquidation feature flag is true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, false, true));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedOtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedOtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LP feature flag is true and liquidation feature flag is false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(true, false, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LLP feature flags is true and liquidation feature flag is false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, true, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LP, LLP and liquidation feature flags are true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(true, true, true));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedLLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedOtherCertificateItemMapper);
    });
})
