import {expect} from "chai";
import {CompanyType} from "../../model/CompanyType";
import {ItemMapperFactory} from "../../service/ItemMapperFactory";
import {OtherCertificateItemMapper} from "../../service/OtherCertificateItemMapper";
import {LPCertificateItemMapper} from "../../service/LPCertificateItemMapper";
import {LLPCertificateItemMapper} from "../../service/LLPCertificateItemMapper";
import { CompanyStatus } from "../../model/CompanyStatus";
import { LiquidatedOtherCertificateItemMapper } from "../../service/LiquidatedOtherCertificateItemMapper";
import { ItemMapper } from "../../service/ItemMapper";
import { NullItemMapper } from "../../service/NullItemMapper";
import { LiquidatedLLPCertificateItemMapper } from "../../service/LiquidatedLLPCertificateItemMapper";

describe("ItemMapperFactory unit tests", () => {

    describe("LP and LLP feature flags set to true", () => {
        let itemMapperFactory: ItemMapperFactory;
        beforeEach("instantiate ItemMapperFactory", () => {
            itemMapperFactory = new ItemMapperFactory([
                [CompanyType.LIMITED_PARTNERSHIP, new Map<string, () => ItemMapper>([
                    [ItemMapperFactory.defaultMapping, () => {return new LPCertificateItemMapper()}]
                ])],
                [CompanyType.LIMITED_LIABILITY_PARTNERSHIP, new Map<string, () => ItemMapper>([
                    [CompanyStatus.LIQUIDATION, () => {return new LiquidatedLLPCertificateItemMapper()}],
                    [ItemMapperFactory.defaultMapping, () => {return new LLPCertificateItemMapper()}]
                ])],
                [ItemMapperFactory.defaultMapping, new Map<string, () => ItemMapper>([
                    [CompanyStatus.LIQUIDATION, () => {return new LiquidatedOtherCertificateItemMapper()}],
                    [ItemMapperFactory.defaultMapping, () => {return new OtherCertificateItemMapper()}]
                ])]
            ], () => {return new NullItemMapper()})
        })
        it("should correctly return OtherCertificateItemMapper for non LP & LLP companies not in liquidation", () => {
            // Given
            const companyType = "any";
            const companyStatus = CompanyStatus.ACTIVE;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType, companyStatus);

            // Then
            expect(itemMapper).to.be.an.instanceOf(OtherCertificateItemMapper);
        })

        it("should correctly return OtherCertificateItemMapper for limited company type", () => {
            // Given
            const companyType = CompanyType.LIMITED_COMPANY;
            const companyStatus = CompanyStatus.ACTIVE;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType, companyStatus);

            // Then
            expect(itemMapper).to.be.an.instanceOf(OtherCertificateItemMapper);
        })

        it("should correctly return LPCertificateItemMapper for limited partnership company type", () => {
            // Given
            const companyType = CompanyType.LIMITED_PARTNERSHIP;
            const companyStatus = CompanyStatus.ACTIVE;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType, companyStatus);

            // Then
            expect(itemMapper).to.be.an.instanceOf(LPCertificateItemMapper);
        })

        it("should correctly return LLPCertificateItemMapper for limited liability partnership company type", () => {
            // Given
            const companyType = CompanyType.LIMITED_LIABILITY_PARTNERSHIP;
            const companyStatus = CompanyStatus.ACTIVE;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType, companyStatus);

            // Then
            expect(itemMapper).to.be.an.instanceOf(LLPCertificateItemMapper);
        })

        it("should correctly return LiquidatedOtherCertificateItemMapper for non LP & LLP companies in liquidation", () => {
            // Given
            const companyType = "any";
            const companyStatus = CompanyStatus.LIQUIDATION;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType, companyStatus);

            // Then
            expect(itemMapper).to.be.an.instanceOf(LiquidatedOtherCertificateItemMapper);
        })

        it("should correctly return LiquidatedLLPCertificateItemMapper for LLP companies in liquidation", () => {
            // Given
            const companyType = CompanyType.LIMITED_LIABILITY_PARTNERSHIP;
            const companyStatus = CompanyStatus.LIQUIDATION;

            // When
            const itemMapper = itemMapperFactory.getItemMapper(companyType, companyStatus);

            // Then
            expect(itemMapper).to.be.an.instanceOf(LiquidatedLLPCertificateItemMapper);
        })

        it("should return NullItemMapper if fallback mapper undefined", () => {
            // Given
            const misconfiguredMapperFactory = new ItemMapperFactory([], () => new NullItemMapper());

            // When
            const itemMapper = misconfiguredMapperFactory.getItemMapper("any", "any");

            // Then
            expect(itemMapper).to.be.an.instanceOf(NullItemMapper);
        });
    })

})
