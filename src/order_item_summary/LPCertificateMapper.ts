import { AbstractCertificateMapper } from "./AbstractCertificateMapper";
import { MapperRequest } from "../mappers/MapperRequest";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { MapUtil } from "../service/MapUtil";

export class LPCertificateMapper extends AbstractCertificateMapper {

    constructor (mapperRequest: MapperRequest) {
        super(mapperRequest);
    }

    protected mapCertificateDetails (): void {
        const itemOptions = this.mapperRequest.item.itemOptions as CertificateItemOptions;
        this.addText("Certificate type", MapUtil.mapCertificateType(itemOptions.certificateType) || "");
        this.addText("Statement of good standing", MapUtil.determineItemOptionsSelectedText(itemOptions.includeGoodStandingInformation));
        this.addText("Principal place of business", MapUtil.mapAddressOptions(itemOptions.principalPlaceOfBusinessDetails));
        this.addText("The names of all current general partners", MapUtil.determineItemOptionsSelectedText(itemOptions.generalPartnerDetails?.includeBasicInformation));
        this.addText("The names of all current limited partners", MapUtil.determineItemOptionsSelectedText(itemOptions.limitedPartnerDetails?.includeBasicInformation));
        this.addText("General nature of business", MapUtil.determineItemOptionsSelectedText(itemOptions.includeGeneralNatureOfBusinessInformation));
    }
}
