import { AbstractCertificateMapper } from "./AbstractCertificateMapper";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { MapUtil } from "../service/MapUtil";
import { CompanyStatus } from "../model/CompanyStatus";
import { MapperRequest } from "../mappers/MapperRequest";

export class LLPCertificateMapper extends AbstractCertificateMapper {

    constructor (mapperRequest: MapperRequest) {
        super(mapperRequest);
    }

    protected mapCertificateDetails (): void {
        const itemOptions = this.mapperRequest.item.itemOptions as CertificateItemOptions;
        this.addText("Certificate type", MapUtil.mapCertificateType(itemOptions.certificateType) || "");
        if (itemOptions.certificateType === "dissolution") {
            return;
        }
        if (itemOptions.companyStatus === CompanyStatus.ACTIVE) {
            this.addText("Statement of good standing", MapUtil.determineItemOptionsSelectedText(itemOptions.includeGoodStandingInformation));
        }
        this.addText("Registered office address", MapUtil.mapAddressOptions(itemOptions.registeredOfficeAddressDetails));
        this.addHtml("The names of all current designated members", MapUtil.mapMembersOptions("Including designated members':", itemOptions.designatedMemberDetails));
        this.addHtml("The names of all current members", MapUtil.mapMembersOptions("Including members':", itemOptions.memberDetails));
        if (itemOptions.companyStatus === CompanyStatus.ADMINISTRATION) {
            this.addText("Administrators' details", MapUtil.determineItemOptionsSelectedText(itemOptions.administratorsDetails?.includeBasicInformation));
        }
        if (itemOptions.companyStatus === CompanyStatus.LIQUIDATION) {
            this.addText("Liquidators' details", MapUtil.determineItemOptionsSelectedText(itemOptions.liquidatorsDetails?.includeBasicInformation));
        }
    }
}
