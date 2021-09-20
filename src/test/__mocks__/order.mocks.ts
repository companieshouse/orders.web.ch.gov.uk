import {CertificateItemOptions, Item, Order} from "@companieshouse/api-sdk-node/dist/services/order/order";
import {ItemOptions} from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import {CompanyType} from "../../model/CompanyType";

export const CERTIFICATE_ID = "CRT-123456-123456";
export const CERTIFIED_COPY_ID = "CCD-123456-123456";
export const MISSING_IMAGE_DELIVERY_ID = "MID-123456-123456";
export const ORDER_ID = "ORD-123456-123456";

export const mockCertificateItem: Item = {
    id: CERTIFICATE_ID,
    companyName: "Company Name",
    companyNumber: "00000000",
    description: "certificate for company 00000000",
    descriptionIdentifier: "certificate",
    descriptionValues: {
        certificate: "certificate for company 00000000",
        companyNumber: "00000000"
    },
    itemCosts: [{
        discountApplied: "0",
        itemCost: "15",
        calculatedCost: "15",
        productType: "certificate"
    }],
    itemOptions: {
        certificateType: "incorporation-with-all-name-changes",
        deliveryMethod: "postal",
        deliveryTimescale: "standard",
        directorDetails: {
            includeBasicInformation: true
        },
        forename: "forename",
        includeGoodStandingInformation: true,
        registeredOfficeAddressDetails: {
            includeAddressRecordsType: "current-and-previous"
        },
        secretaryDetails: {
            includeBasicInformation: true
        },
        surname: "surname",
        companyType: CompanyType.LIMITED_LIABILITY_COMPANY
    } as CertificateItemOptions,
    etag: "abcdefg123456",
    kind: "item#certificate",
    links: {
        self: "/orderable/certificates/" + CERTIFICATE_ID
    },
    postalDelivery: true,
    quantity: 1,
    itemUri: "/orderable/certificates/" + CERTIFICATE_ID,
    status: "unknown",
    postageCost: "0",
    totalItemCost: "15",
    customerReference: "mycert",
    satisfiedAt: "2020-05-15T08:41:05.798Z"
};

export const mockDissolvedCertificateItem: Item = {
    id: CERTIFICATE_ID,
    companyName: "Company Name",
    companyNumber: "00000000",
    description: "certificate for company 00000000",
    descriptionIdentifier: "certificate",
    descriptionValues: {
        certificate: "certificate for company 00000000",
        companyNumber: "00000000"
    },
    itemCosts: [{
        discountApplied: "0",
        itemCost: "15",
        calculatedCost: "15",
        productType: "certificate"
    }],
    itemOptions: {
        certificateType: "dissolution",
        deliveryMethod: "postal",
        deliveryTimescale: "standard",
        directorDetails: {},
        forename: "forename",
        includeGoodStandingInformation: undefined,
        registeredOfficeAddressDetails: {},
        secretaryDetails: {},
        surname: "surname"
    } as CertificateItemOptions,
    etag: "abcdefg123456",
    kind: "item#certificate",
    links: {
        self: "/orderable/certificates/" + CERTIFICATE_ID
    },
    postalDelivery: true,
    quantity: 1,
    itemUri: "/orderable/certificates/" + CERTIFICATE_ID,
    status: "unknown",
    postageCost: "0",
    totalItemCost: "15",
    customerReference: "mycert",
    satisfiedAt: "2020-05-15T08:41:05.798Z"
};

export const mockCertificateOrderResponse: Order = {
    orderedAt: "2019-12-16T09:16:17.791Z",
    orderedBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`
    },
    paymentReference: "1234567",
    etag: "abcdefghijk123456789",
    deliveryDetails: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "country",
        forename: "forename",
        locality: "locality",
        postalCode: "postal code",
        region: "region",
        surname: "surname",
        poBox: "po box"
    },
    items: [mockCertificateItem],
    kind: "order",
    totalOrderCost: "15",
    reference: ORDER_ID
};

export const mockDissolvedCertificateOrderResponse: Order = {
    orderedAt: "2019-12-16T09:16:17.791Z",
    orderedBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`
    },
    paymentReference: "1234567",
    etag: "abcdefghijk123456789",
    deliveryDetails: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "country",
        forename: "forename",
        locality: "locality",
        postalCode: "postal code",
        region: "region",
        surname: "surname",
        poBox: "po box"
    },
    items: [mockDissolvedCertificateItem],
    kind: "order",
    totalOrderCost: "15",
    reference: ORDER_ID
};

export const mockCertifiedCopyItem: Item = {
    id: CERTIFICATE_ID,
    companyName: "Company Name",
    companyNumber: "00000000",
    description: "certified-copy for company 00000000",
    descriptionIdentifier: "certified-copy",
    descriptionValues: {
        certificate: "certified-copy for company 00000000",
        companyNumber: "00000000"
    },
    itemCosts: [{
        discountApplied: "0",
        itemCost: "30",
        calculatedCost: "30",
        productType: "certified-copy"
    }],
    itemOptions: {
        deliveryMethod: "postal",
        deliveryTimescale: "standard",
        filingHistoryDocuments: [{
            filingHistoryDate: "2010-02-12",
            filingHistoryDescription: "change-person-director-company-with-change-date",
            filingHistoryDescriptionValues: {
                change_date: "2010-02-12",
                officer_name: "Thomas David Wheare"
            },
            filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
            filingHistoryType: "CH01",
            filingHistoryCost: "15"
        },
        {
            filingHistoryDate: "2009-03-12",
            filingHistoryDescription: "accounts-with-accounts-type-group",
            filingHistoryDescriptionValues: {
                made_up_date: "2008-08-31"
            },
            filingHistoryId: "MjAzNTYyNTE5M2FkaXF6a2N4",
            filingHistoryType: "AA",
            filingHistoryCost: "15"
        }
        ]
    },
    etag: "abcdefg123456",
    kind: "item#certified-copy",
    links: {
        self: "/orderable/certified-copies/" + CERTIFIED_COPY_ID
    },
    postalDelivery: true,
    quantity: 1,
    itemUri: "/orderable/certified-copies/" + CERTIFIED_COPY_ID,
    status: "unknown",
    postageCost: "0",
    totalItemCost: "30",
    customerReference: "mycert",
    satisfiedAt: "2020-05-15T08:41:05.798Z"
};

export const mockCertifiedCopyOrderResponse: Order = {
    orderedAt: "2019-12-16T09:16:17.791Z",
    orderedBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`
    },
    paymentReference: "1234567",
    etag: "abcdefghijk123456789",
    deliveryDetails: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "country",
        forename: "forename",
        locality: "locality",
        postalCode: "postal code",
        region: "region",
        surname: "surname",
        poBox: "po box"
    },
    items: [mockCertifiedCopyItem],
    kind: "order",
    totalOrderCost: "30",
    reference: ORDER_ID
};

export const mockMissingImageDeliveryItem: Item = {
    id: MISSING_IMAGE_DELIVERY_ID,
    companyName: "The Company",
    companyNumber: "00000000",
    description: "missing image delivery for company 00000000",
    descriptionIdentifier: "missing-image-delivery",
    descriptionValues: {
        company_number: "00000000",
        "missing-image-delivery": "missing image delivery for company 00000000"
    },
    itemCosts: [
        {
            discountApplied: "0",
            itemCost: "3",
            calculatedCost: "3",
            productType: "missing-image-delivery"
        }
    ],
    itemOptions: {
        filingHistoryDate: "2015-05-26",
        filingHistoryDescription: "appoint-person-director-company-with-name",
        filingHistoryDescriptionValues: {
            officer_name: "Mr Richard John Harris"
        },
        filingHistoryId: "MzEyMzcyNDc2OWFkaXF6a2N4",
        filingHistoryType: "AP01"
    },
    etag: "7ae7d006fab4a6bab9fafcfea1eef1b78ffa4e52",
    kind: "item#missing-image-delivery",
    links: {
        self: "/orderable/missing-image-deliveries/" + MISSING_IMAGE_DELIVERY_ID
    },
    quantity: 1,
    itemUri: "/orderable/missing-image-deliveries/" + MISSING_IMAGE_DELIVERY_ID,
    status: "unknown",
    postageCost: "0",
    totalItemCost: "3",
    postalDelivery: false
};

export const mockMissingImageDeliveryOrderResponse: Order = {
    paymentReference: "q4nn5UxZiZxVG2e",
    etag: "80bd2953c79729aa0885f6987208690341376db0",
    items: [mockMissingImageDeliveryItem],
    kind: "order",
    totalOrderCost: "3",
    reference: ORDER_ID,
    orderedAt: "2020-10-07T11:09:46.196",
    orderedBy: {
        email: "demo@ch.gov.uk",
        id: "67ZeMsvAEgkBWs7tNKacdrPvOmQ"
    },
    links: {
        self: "/orders/" + ORDER_ID
    }
};
