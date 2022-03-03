import { ItemMapperFactoryConfig } from "../service/ItemMapperFactoryConfig";

const getEnvironmentValue = (key: string, defaultValue?: any): string => {
    const isMandatory: boolean = !defaultValue;
    const value: string = process.env[key] || "";

    if (!value && isMandatory) {
        throw new Error(`Please set the environment variable "${key}"`);
    }

    return value || defaultValue as string;
};

export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");

export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");

export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");

export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");

export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");

export const API_URL = getEnvironmentValue("API_URL");

export const CHS_URL = getEnvironmentValue("CHS_URL");

export const APPLICATION_NAME = "orders.web.ch.gov.uk";

export const SERVICE_NAME_CERTIFIED_COPIES = "Order a certified document";

export const SERVICE_NAME_CERTIFICATES = "Order a certificate";

export const SERVICE_NAME_MISSING_IMAGE_DELIVERIES = "Request a document";

export const SERVICE_NAME_GENERIC = "";

export const DISPATCH_DAYS = getEnvironmentValue("DISPATCH_DAYS");

export const DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED = getEnvironmentValue("DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED", "false") === "true";

export const DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED = getEnvironmentValue("DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED", "false") === "true";

export const LIQUIDATED_COMPANY_CERTIFICATES_ENABLED = getEnvironmentValue("LIQUIDATED_COMPANY_CERTIFICATES_ENABLED", "false") === "true";

export const ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED = getEnvironmentValue("ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED", "false") === "true";

export const RETRY_CHECKOUT_NUMBER = getEnvironmentValue("RETRY_CHECKOUT_NUMBER");

export const RETRY_CHECKOUT_DELAY = getEnvironmentValue("RETRY_CHECKOUT_DELAY");
