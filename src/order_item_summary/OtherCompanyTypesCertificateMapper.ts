import { AbstractCertificateMapper } from "./AbstractCertificateMapper";
import { MapperRequest } from "../mappers/MapperRequest";
import { MapUtil } from "../service/MapUtil";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { CompanyStatus } from "../model/CompanyStatus";

export class OtherCompanyTypesCertificateMapper extends AbstractCertificateMapper {

    constructor (mapperRequest: MapperRequest) {
        super(mapperRequest);
    }

    mapCertificateDetails (): void {
        const itemOptions = this.mapperRequest.item.itemOptions as CertificateItemOptions;
        this.addText("Certificate type", MapUtil.mapCertificateType(itemOptions.certificateType) || "");
        if (itemOptions.certificateType === "dissolution") {
            return;
        }
        if (itemOptions.companyStatus === CompanyStatus.ACTIVE) {
            this.addText("Summary statement previously known as statement of good standing", MapUtil.determineItemOptionsSelectedText(itemOptions.includeGoodStandingInformation));
        }
        this.addText("Registered office address", MapUtil.mapAddressOptions(itemOptions.registeredOfficeAddressDetails));
        this.addHtml("The names of all current company directors", MapUtil.determineDirectorOrSecretaryOptionsText(itemOptions.directorDetails, "directors"));
        this.addHtml("The names of all current secretaries", MapUtil.determineDirectorOrSecretaryOptionsText(itemOptions.secretaryDetails, "secretaries"));
        this.addText("Company objects", MapUtil.determineItemOptionsSelectedText(itemOptions.includeCompanyObjectsInformation));
        if (itemOptions.companyStatus === CompanyStatus.ADMINISTRATION) {
            this.addText("Administrators' details", MapUtil.determineItemOptionsSelectedText(itemOptions.administratorsDetails?.includeBasicInformation));
        }
        if (itemOptions.companyStatus === CompanyStatus.LIQUIDATION) {
            this.addText("Liquidators' details", MapUtil.determineItemOptionsSelectedText(itemOptions.liquidatorsDetails?.includeBasicInformation));
        }
    }
}
