import { ITEM_MAPPER_FACTORY_CONFIG } from "config/config";

export class ItemMapperFactoryConfig {

    public constructor(private _config: { llpCertificateOrdersEnabled: string, lpCertificateOrdersEnabled: string }) {
        
    }

    set config(config: { llpCertificateOrdersEnabled: string, lpCertificateOrdersEnabled: string }) {
        this._config = config;
    }

    get config() {
        return this._config;
    }
}