import {ItemMapperFactoryConfig} from "../../service/ItemMapperFactoryConfig";
import {expect} from "chai";
import {CompanyType} from "../../model/CompanyType";
import {OtherCertificateItemMapper} from "../../service/OtherCertificateItemMapper";
import {LLPCertificateItemMapper} from "../../service/LLPCertificateItemMapper";
import {LPCertificateItemMapper} from "../../service/LPCertificateItemMapper";
import {FeatureFlags} from "../../config/FeatureFlags";


describe("ItemMapperFactoryConfig unit tests", ()=>{
    it("correctly returns OtherCertificateItemMapper when LP & LLP Feature flags are false", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_LIABILITY_PARTNERSHIP)).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_PARTNERSHIP)).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_COMPANY)).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns LPCertificateItemMapper when LP Feature flags is true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(true, false));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_LIABILITY_PARTNERSHIP)).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_PARTNERSHIP)).to.be.instanceOf(LPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_COMPANY)).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns LLPCertificateItemMapper when LLP Feature flags is true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(false, true));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_LIABILITY_PARTNERSHIP)).to.be.instanceOf(LLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_PARTNERSHIP)).to.be.instanceOf(OtherCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_COMPANY)).to.be.instanceOf(OtherCertificateItemMapper);
    });

    it("correctly returns LPCertificateItemMapper & LLPCertificateItemMapper when LP & LLP Feature flags are true", () => {
        // Given
        const itemMapperFactoryConfig = new ItemMapperFactoryConfig(new FeatureFlags(true, true));

        // When
        const itemMapperFactory = itemMapperFactoryConfig.getInstance();

        // Then
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_LIABILITY_PARTNERSHIP)).to.be.instanceOf(LLPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_PARTNERSHIP)).to.be.instanceOf(LPCertificateItemMapper);
        expect(itemMapperFactory.getItemMapper(CompanyType.LIMITED_COMPANY)).to.be.instanceOf(OtherCertificateItemMapper);
    });
})