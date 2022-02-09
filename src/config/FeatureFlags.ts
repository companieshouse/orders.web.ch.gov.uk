import {
    LIQUIDATED_COMPANY_CERTIFICATES_ENABLED,
    DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED,
    DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED
} from "./config";

export class FeatureFlags {
    constructor(private _lpCertificateOrdersEnabled: boolean, private _llpCertificateOrdersEnabled: boolean, private _liquidationEnabled: boolean) {
    }

    get lpCertificateOrdersEnabled(): boolean {
        return this._lpCertificateOrdersEnabled;
    }

    set lpCertificateOrdersEnabled(value: boolean) {
        this._lpCertificateOrdersEnabled = value;
    }

    get llpCertificateOrdersEnabled(): boolean {
        return this._llpCertificateOrdersEnabled;
    }

    set llpCertificateOrdersEnabled(value: boolean) {
        this._llpCertificateOrdersEnabled = value;
    }

    get liquidationEnabled (): boolean {
        return this._liquidationEnabled;
    }

    set liquidationEnabled (value: boolean) {
        this._liquidationEnabled = value;
    }
}

export const FEATURE_FLAGS = new FeatureFlags(DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED, DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED, LIQUIDATED_COMPANY_CERTIFICATES_ENABLED);
