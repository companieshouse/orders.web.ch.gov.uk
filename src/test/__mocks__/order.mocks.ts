import { Item, Order } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { ItemOptions as CertificateItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Checkout } from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import { CompanyType } from "../../model/CompanyType";
import { GovUkOrderItemSummaryView } from "../../order_item_summary/GovUkOrderItemSummaryView";
import { GovUkOrderCertifiedCopyItemSummaryView } from "../../order_item_summary/GovUkOrderCertifiedCopyItemSummaryView";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment/types";

export const CERTIFICATE_ID = "CRT-123456-123456";
export const CERTIFIED_COPY_ID = "CCD-123456-123456";
export const MISSING_IMAGE_DELIVERY_ID = "MID-123456-123456";
export const ORDER_ID = "ORD-123456-123456";
export const ACCESS_TOKEN = "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw";

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
        companyType: CompanyType.LIMITED_COMPANY
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
        includeEmailCopy: false,
        directorDetails: {},
        forename: "forename",
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

export const mockOrderResponse: Order = {
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
    items: [],
    kind: "order",
    totalOrderCost: "15",
    reference: ORDER_ID
};

export const mockCertificateCheckoutResponse: Checkout = {
    paidAt: "2019-12-16T09:16:17.791Z",
    status: "paid",
    checkedOutBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`,
        payment: `"/basket/checkouts/${ORDER_ID}/payment"`
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

export const mockDissolvedCertificateCheckoutResponse: Checkout = {
    paidAt: "2019-12-16T09:16:17.791Z",
    status: "paid",
    checkedOutBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`,
        payment: `"/basket/checkouts/${ORDER_ID}/payment"`
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
    id: CERTIFIED_COPY_ID,
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
        collectionLocation: "cardiff",
        contactNumber: "0123456789",
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
        ],
        forename: "forename",
        surname: "surname"
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

export const mockCertifiedCopyCheckoutResponse: Checkout = {
    paidAt: "2019-12-16T09:16:17.791Z",
    status: "paid",
    checkedOutBy: {
        id: "123456",
        email: "email@examlpe.come"
    },
    links: {
        self: `/orders/${ORDER_ID}`,
        payment: `"/basket/checkouts/${ORDER_ID}/payment"`
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
        poBox: "po box",
        companyName: "company name"
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
        filingHistoryBarcode: "barcode",
        filingHistoryCategory: "category",
        filingHistoryCost: "cost",
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

export const mockMissingImageDeliveryCheckoutResponse: Checkout = {
    paymentReference: "q4nn5UxZiZxVG2e",
    etag: "80bd2953c79729aa0885f6987208690341376db0",
    items: [mockMissingImageDeliveryItem],
    kind: "order",
    totalOrderCost: "3",
    reference: ORDER_ID,
    paidAt: "2020-10-07T11:09:46.196",
    status: "pending",
    checkedOutBy: {
        id: "123456",
        email: "email@example.come"
    },
    links: {
        self: "/orders/" + ORDER_ID,
        payment: `"/basket/checkouts/${ORDER_ID}/payment"`
    }
};


export const mockPaymentResponse: Payment = {
    amount: "15",
    availablePaymentMethods: [ "credit-card"],
    companyNumber: "00000000",
    completedAt: "2019-12-16T09:16:17.791Z",
    createdAt: "2019-12-16T09:16:17.791Z",
    createdBy: {
        email: "demo@test.com",
        forename: "John",
        id: "123456",
        surname: "Smith",
    },
    description: "certificate for company 00000000",
    etag: "abcdefg123456",
    kind: "payment-session#payment-session",
    links: {
        journey: "paymenturl/payments/q4nn5UxZiZxVG2e/pay",
        resource: "localurl/basket/checkouts/ORD-123456-789/payment",
        self: "payments/q4nn5UxZiZxVG2e",
    },
    paymentMethod: "credit-card",
    reference: "orderable_item_ORD-123456-123456",
    status: "paid"
}

export const mockPaymentResponseReferenceMapped: Payment = {
    amount: "15",
    availablePaymentMethods: [ "credit-card"],
    companyNumber: "00000000",
    completedAt: "2019-12-16T09:16:17.791Z",
    createdAt: "2019-12-16T09:16:17.791Z",
    createdBy: {
        email: "demo@test.com",
        forename: "John",
        id: "123456",
        surname: "Smith",
    },
    description: "certificate for company 00000000",
    etag: "abcdefg123456",
    kind: "payment-session#payment-session",
    links: {
        journey: "paymenturl/payments/q4nn5UxZiZxVG2e/pay",
        resource: "localurl/basket/checkouts/ORD-123456-789/payment",
        self: "payments/q4nn5UxZiZxVG2e",
    },
    paymentMethod: "credit-card",
    reference: "q4nn5UxZiZxVG2e",
    status: "paid"
}

export const mockMidOrderItemView: GovUkOrderItemSummaryView = {
    orderId: "ORD-123123-123123",
    itemId: MISSING_IMAGE_DELIVERY_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "The Company"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Date"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "26 May 2015"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "AP01"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Description"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Appointment of Mr Richard John Harris as a director"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£3"
                }
            }
        ]
    },
    backLinkUrl: "/orders/ORD-123123-123123"
};

export const mockCertCopyOrderItemView: GovUkOrderCertifiedCopyItemSummaryView = {
    orderDetails: {
        orderId: "ORD-123123-123123",
        itemId: CERTIFIED_COPY_ID,
        itemDetails: {
            entries: [
                {
                    key: {
                        classes: "govuk-!-width-one-third",
                        text: "Company name"
                    },
                    value: {
                        classes: "govuk-!-width-two-thirds",
                        text: "Company Name"
                    }
                },
                {
                    key: {
                        classes: "govuk-!-width-one-third",
                        text: "Company number"
                    },
                    value: {
                        classes: "govuk-!-width-two-thirds",
                        text: "00000000"
                    }
                },
                {
                    key: {
                        classes: "govuk-!-width-one-third",
                        text: "Dispatch method"
                    },
                    value: {
                        classes: "govuk-!-width-two-thirds",
                        text: "Standard (aim to send out within 10 working days)"
                    }
                }
            ]
        },
        backLinkUrl: "/orders/ORD-123123-123123"
    },
    documentDetails: [
        [
            {
                text: "12 Feb 2010"
            },
            {
                text: "CH01"
            },
            {
                text: "Director's details changed for Thomas David Wheare on 12 February 2010"
            },
            {
                text: "£15"
            }
        ]
    ]
};

export const mockActiveLtdCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Summary statement previously known as statement of good standing"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current company directors"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current secretaries"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company objects"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockAdministratedLtdCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current company directors"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current secretaries"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company objects"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Administrators' details"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                },
                
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockLiquidatedLtdCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current company directors"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current secretaries"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company objects"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Liquidators' details"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockDissolvedLtdCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Dissolution with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockActiveLLPCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Summary statement previously known as statement of good standing"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current designated members"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current members"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
            key: {
            classes: "govuk-!-width-one-third",
                text: "Quantity"
            },
            value: {
                classes: "govuk-!-width-two-thirds",
                    text: "1"
                }
            }
            
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockAdministratedLLPCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current designated members"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: `Including designated members&#39;:<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>`
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current members"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: `Including members&#39;:<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>`
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Administrators' details"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockLiquidatedLLPCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Registered office address"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current designated members"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current members"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    html: "No"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Liquidators' details"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockDissolvedLLPCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Dissolution with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};

export const mockActiveLPCertificateItemView: GovUkOrderItemSummaryView = {
    orderId: ORDER_ID,
    itemId: CERTIFICATE_ID,
    itemDetails: {
        entries: [
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company name"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Company Name"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Company number"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "00000000"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Certificate type"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Incorporation with all company name changes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Summary statement previously known as statement of good standing"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Principal place of business"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Current address and the one previous"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current general partners"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "The names of all current limited partners"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "General nature of business"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Yes"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Dispatch method"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Standard (aim to send out within 10 working days)"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Email copy required"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "Email only available for express dispatch"
                }
            },
            {
                key: {
                    classes: "govuk-!-width-one-third",
                    text: "Fee"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                    text: "£15"
                }
            },
            {
                key: {
                classes: "govuk-!-width-one-third",
                    text: "Quantity"
                },
                value: {
                    classes: "govuk-!-width-two-thirds",
                        text: "1"
                    }
                }
        ]
    },
    backLinkUrl: `/orders/${ORDER_ID}`
};
