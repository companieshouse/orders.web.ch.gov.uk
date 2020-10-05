import { NextFunction, Request, Response } from "express";
import { Session } from "ch-node-session-handler";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { Order, CertificateItemOptions, CertifiedCopyItemOptions } from "ch-sdk-node/dist/services/order/order";
import { createLogger } from "ch-structured-logging";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";
import { FilingHistoryDocuments } from "ch-sdk-node/dist/services/order/certified-copies";
import { getOrder, getBasket } from "../client/api.client";
import { ORDER_COMPLETE } from "../model/template.paths";
import { APPLICATION_NAME, SERVICE_NAME_CERTIFICATES, SERVICE_NAME_CERTIFIED_COPIES } from "../config/config";
import { mapDeliveryMethod, mapDeliveryDetails, mapFilingHistoryDate } from "../utils/check.details.utils";
import { getFullFilingHistoryDescription } from "../config/api.enumerations";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.orderId;
        const status = req.query.status;
        const ref = req.query.ref;
        const itemType = req.query.itemType;
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

        if (itemType === undefined || itemType === "") {
            const basket = await getBasket(accessToken);
            const item = basket?.items?.[0];

            return res.redirect(req.originalUrl + getItemTypeUrlParam(item?.kind));
        }

        logger.info(`Order confirmation, order_id=${orderId}, ref=${ref}, status=${status}, itemType=${itemType}, user_id=${userId}`);
        if (status === "cancelled" || status === "failed") {
            const basket = await getBasket(accessToken);
            const item = basket?.items?.[0];
            if (item?.kind === "item#certificate" || item?.kind === "item#certified-copy") {
                const redirectUrl = item?.itemUri + "/check-details";
                logger.info(`Redirecting to ${redirectUrl}`);
                return res.redirect(redirectUrl);
            }
        }

        const order: Order = await getOrder(accessToken, orderId);
        logger.info(`Order retrieved order_id=${order.reference}, user_id=${userId}`);

        const orderDetails = {
            referenceNumber: order.reference,
            referenceNumberAriaLabel: order.reference.replace(/-/g, " hyphen ")
        };

        const item = order.items[0];

        const totalItemsCost = `£${item?.totalItemCost}`;

        const itemDetails = {
            companyName: item?.companyName,
            companyNumber: item?.companyNumber
        };
        const deliveryDetails = {
            deliveryMethod: mapDeliveryMethod(item?.itemOptions),
            address: mapDeliveryDetails(order.deliveryDetails)
        };
        const paymentDetails = {
            amount: "£" + order?.totalOrderCost,
            paymentReference: order?.paymentReference,
            orderedAt: mapDate(order?.orderedAt)
        };

        const itemKind = item?.kind;
        let titleText;
        let serviceUrl = "/";
        let serviceName;
        let pageTitle;
        let happensNext;
        let orderDetailsTable;
        let filingHistoryDocuments;
        let documentDetailsTable = 0;
        let certificateDetails;

        if (itemKind === "item#certificate") {
            const itemOptionsCertificate = item.itemOptions as CertificateItemOptions;
            certificateDetails = {
                certificateType: mapCertificateType(itemOptionsCertificate.certificateType),
                includedOnCertificate: mapIncludedOnCertificate(item?.itemOptions)
            };
            const certificatesOrderDetails = [
                {
                    key: {
                        text: "Company name",
                        classes: "govuk-!-width-one-half"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='companyNameValue'>" + itemDetails.companyName + "</p>"
                    }
                },
                {
                    key: {
                        text: "Company number"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='companyNumberValue'>" + itemDetails.companyNumber + "</p>"
                    }
                },
                {
                    key: {
                        text: "Certificate type",
                        classes: "govuk-!-width-one-half"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='certificateTypeValue'>" + certificateDetails.certificateType + "</p>"
                    }
                },
                {
                    key: {
                        text: "Included on certificate"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='includedOnCertificateValue'>" + certificateDetails.includedOnCertificate + "</p>"
                    }
                },
                {
                    key: {
                        text: "Delivery method"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='deliveryMethodValue'>" + deliveryDetails.deliveryMethod + "</p>"
                    }
                },
                {
                    key: {
                        text: "Delivery details"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='deliveryAddressValue'>" + deliveryDetails.address + "</p>"
                    }
                }
            ];
            serviceUrl = `/company/${item?.companyNumber}/orderable/certificates`;
            serviceName = SERVICE_NAME_CERTIFICATES;
            titleText = "Certificate ordered";
            pageTitle = "Certificate ordered confirmation";
            happensNext = "We'll prepare the certificate and aim to dispatch it within 4 working days.";
            orderDetailsTable = certificatesOrderDetails;
        };

        if (itemKind === "item#certified-copy") {
            const itemOptionsCertifiedCopy = item.itemOptions as CertifiedCopyItemOptions;
            const certifiedCopiesOrderDetails = [
                {
                    key: {
                        text: "Company name",
                        classes: "govuk-!-width-one-half"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='companyNameValue'>" + itemDetails.companyName + "</p>"
                    }
                },
                {
                    key: {
                        text: "Company number"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='companyNumberValue'>" + itemDetails.companyNumber + "</p>"
                    }
                },
                {
                    key: {
                        text: "Delivery method"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='deliveryMethodValue'>" + deliveryDetails.deliveryMethod + "</p>"
                    }
                },
                {
                    key: {
                        text: "Delivery details"
                    },
                    value: {
                        classes: "govuk-!-width-one-half",
                        html: "<p id='deliveryAddressValue'>" + deliveryDetails.address + "</p>"
                    }
                }
            ];
            serviceUrl = `/company/${item?.companyNumber}/orderable/certified-copies`;
            serviceName = SERVICE_NAME_CERTIFIED_COPIES;
            titleText = "Certified document order confirmed";
            pageTitle = "Certified document order confirmation";
            happensNext = "We'll prepare your order and aim to dispatch it within 4 working days.";
            orderDetailsTable = certifiedCopiesOrderDetails;
            filingHistoryDocuments = mapFilingHistoriesDocuments(itemOptionsCertifiedCopy.filingHistoryDocuments);
            documentDetailsTable = 1;
        };

        res.render(ORDER_COMPLETE, {
            pageTitle,
            happensNext,
            orderDetailsTable,
            documentDetailsTable,
            serviceUrl,
            serviceName,
            orderDetails,
            itemDetails,
            certificateDetails,
            deliveryDetails,
            paymentDetails,
            titleText,
            itemKind,
            filingHistoryDocuments,
            totalItemsCost,
            templateName: ORDER_COMPLETE
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const mapCertificateType = (cerificateType: string): string | null => {
    if (!cerificateType) {
        return null;
    }
    if (cerificateType === "incorporation-with-all-name-changes") {
        return "Incorporation with all company name changes";
    }
    const cleanedCertificateType = cerificateType.replace(/-/g, " ");
    return cleanedCertificateType.charAt(0).toUpperCase() + cleanedCertificateType.slice(1);
};

export const mapDate = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    const hour = new Intl.DateTimeFormat("en", { hour: "2-digit", hour12: false }).format(d);
    const minute = new Intl.DateTimeFormat("en", { minute: "2-digit" }).format(d);
    const second = new Intl.DateTimeFormat("en", { second: "numeric" }).format(d);

    const cleanedMinute = mapTimeLessThan10(minute);
    const cleanedSecond = mapTimeLessThan10(second);

    return `${day} ${month} ${year} - ${hour}:${cleanedMinute}:${cleanedSecond}`;
};

const mapTimeLessThan10 = (time: string): string => {
    const timeInt = parseInt(time, 10);
    if (timeInt < 10) {
        return "0" + time;
    }
    return time;
};

export const mapDateFullMonth = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    return `${day} ${month} ${year}`;
};

export const mapIncludedOnCertificate = (itemOptions: Record<string, any>): string | null => {
    const includedOnCertificate: string[] = [];
    if (itemOptions?.includeGoodStandingInformation === true) {
        includedOnCertificate.push("Statement of good standing");
    }
    if (itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType !== undefined &&
        itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType?.length !== 0) {
        includedOnCertificate.push("Registered office address");
    }
    if (itemOptions?.directorDetails?.includeBasicInformation === true) {
        includedOnCertificate.push("Directors");
    }
    if (itemOptions?.secretaryDetails?.includeBasicInformation === true) {
        includedOnCertificate.push("Secretaries");
    }
    if (itemOptions?.includeCompanyObjectsInformation === true) {
        includedOnCertificate.push("Company objects");
    }
    return includedOnCertificate.length === 0 ? "" : includedOnCertificate.reduce((accum, value) => accum + "<br/>" + value);
};

export const mapFilingHistoryDescriptionValues = (description: string, descriptionValues: Record<string, string>) => {
    if (descriptionValues.description) {
        return descriptionValues.description;
    } else {
        return Object.entries(descriptionValues).reduce((newObj, [key, val]) => {
            const value = key.includes("date") ? mapDateFullMonth(val) : val;
            return newObj.replace("{" + key + "}", value as string);
        }, description);
    }
};

export const removeAsterisks = (description: string) => {
    return description.replace(/\*/g, "");
};

export const addCurrency = (filingHistoryCost: string) => {
    return `£${filingHistoryCost}`;
};

export const mapFilingHistoriesDocuments = (filingHistoryDocuments: FilingHistoryDocuments[]) => {
    const mappedFilingHistories = filingHistoryDocuments.map(filingHistoryDocument => {
        const descriptionFromFile = getFullFilingHistoryDescription(filingHistoryDocument.filingHistoryDescription);
        const mappedFilingHistoryDescription = mapFilingHistoryDescriptionValues(descriptionFromFile, filingHistoryDocument.filingHistoryDescriptionValues || {});
        const cleanedFilingHistoryDescription = removeAsterisks(mappedFilingHistoryDescription);
        const mappedFilingHistoryDescriptionDate = mapFilingHistoryDate(filingHistoryDocument.filingHistoryDate);
        const mappedFilingHistoryCost = addCurrency(filingHistoryDocument.filingHistoryCost);
        return {
            filingHistoryDate: mappedFilingHistoryDescriptionDate,
            filingHistoryDescription: cleanedFilingHistoryDescription,
            filingHistoryId: filingHistoryDocument.filingHistoryId,
            filingHistoryType: filingHistoryDocument.filingHistoryType,
            filingHistoryCost: mappedFilingHistoryCost
        };
    });
    return mappedFilingHistories;
};

export const getItemTypeUrlParam = (kind: string | undefined):string => {
    if (kind === "item#certificate") {
        return "&itemType=certificate";
    }

    if (kind === "item#certified-copy") {
        return "&itemType=certified-copy";
    }

    if (kind === "item#missing-image-delivery") {
        return "&itemType=missing-image-delivery";
    }

    return "";
}
