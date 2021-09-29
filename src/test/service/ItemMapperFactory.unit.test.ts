import {expect} from "chai";
import {CompanyType} from "../../model/CompanyType";
import {ItemMapperFactory} from "../../service/ItemMapperFactory";
import {OtherCertificateItemMapper} from "../../service/OtherCertificateItemMapper";
import {LPCertificateItemMapper} from "../../service/LPCertificateItemMapper";
import {LLPCertificateItemMapper} from "../../service/LLPCertificateItemMapper";
import { ItemMapperFactoryConfig } from "../../service/ItemMapperFactoryConfig";

describe("ItemMapperFactory unit tests", () => {
    const TRUE: string = "true";

    describe("LP and LLP feature flags set to true", () => {
        let itemMapperFactory: ItemMapperFactory;
        beforeEach("instantiate ItemMapperFactory", () => {
            itemMapperFactory = new ItemMapperFactory(new ItemMapperFactoryConfig({ llpCertificateOrdersEnabled: TRUE, lpCertificateOrdersEnabled: TRUE }))
        })
        it("should correctly return OtherCertificateItemMapper for non LP & LLP companies", () => {
            // Given
            const companyType = "any";

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType);

            // Then
            expect(itemMapper).to.be.an.instanceOf(OtherCertificateItemMapper);
        })

        it("should correctly return OtherCertificateItemMapper for limited company type", () => {
            // Given
            const companyType = CompanyType.LIMITED_LIABILITY_COMPANY;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType);

            // Then
            expect(itemMapper).to.be.an.instanceOf(OtherCertificateItemMapper);
        })

        it("should correctly return LPCertificateItemMapper for limited partnership company type", () => {
            // Given
            const companyType = CompanyType.LIMITED_PARTNERSHIP;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType);

            // Then
            expect(itemMapper).to.be.an.instanceOf(LPCertificateItemMapper);
        })

        it("should correctly return LLPCertificateItemMapper for limited liability partnership company type", () => {
            // Given
            const companyType = CompanyType.LIMITED_LIABILITY_PARTNERSHIP;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType);

            // Then
            expect(itemMapper).to.be.an.instanceOf(LLPCertificateItemMapper);
        })
    })
})
