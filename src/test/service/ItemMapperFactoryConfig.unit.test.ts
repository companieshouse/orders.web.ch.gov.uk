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
import { AdministratedOtherCertificateItemMapper } from "../../service/AdministratedOtherCertificateItemMapper";
import { AdministratedLLPCertificateItemMapper } from "../../service/AdministratedLLPCertificateItemMapper";


describe("ItemMapperFactoryConfig unit tests", ()=>{
    it("correctly returns item mappers when LP, LLP and status feature flags are false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, false, false, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ADMINISTRATION})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ADMINISTRATION})).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LP & LLP feature flags are false and status feature flags are true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, false, true, true));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedOtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ADMINISTRATION})).to.be.instanceOf(AdministratedOtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedOtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ADMINISTRATION})).to.be.instanceOf(AdministratedOtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LP feature flag is true and status feature flags are false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(true, false, false, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LLP feature flags is true and status feature flags are false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, true, false, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns item mappers when LP, LLP and status feature flags are true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(true, true, true, true));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedLLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_LIABILITY_PARTNERSHIP, companyStatus: CompanyStatus.ADMINISTRATION})).to.be.instanceOf(AdministratedLLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_PARTNERSHIP, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(LPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ACTIVE})).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.LIQUIDATION})).to.be.instanceOf(LiquidatedOtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper({companyType: CompanyType.LIMITED_COMPANY, companyStatus: CompanyStatus.ADMINISTRATION})).to.be.instanceOf(AdministratedOtherCertificateItemMapper);
    });
})
