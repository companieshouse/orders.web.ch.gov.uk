import { NextFunction, Request, Response } from "express";
import { Session } from "ch-node-session-handler";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { Order } from "ch-sdk-node/dist/services/order/order";

import { getOrder } from "../client/api.client";
import { ORDER_COMPLETE } from "../model/template.paths";

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.orderId;
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;

        const order: Order = await getOrder(accessToken, orderId);

        const orderDetails = {
            referenceNumber: order.reference
        };

        const item = order.items[0];

        const itemDetails = {
            companyName: item?.companyName,
            companyNumber: item?.companyNumber
        };
        const certificateDetails = {
            certificateType: mapCertificateType(item?.itemOptions?.certificateType),
            includedOnCertificate: mapIncludedOnCertificate(item?.itemOptions)
        };
        const deliveryDetails = {
            deliveryMethod: mapDeliveryMethod(item?.itemOptions),
            address: mapAddress(order.deliveryDetails)
        };
        const paymentDetails = {
            amount: "£" + order?.totalOrderCost,
            paymentReference: order?.paymentReference,
            orderedAt: mapDate(order?.orderedAt)
        };

        res.render(ORDER_COMPLETE, {
            orderDetails,
            itemDetails,
            certificateDetails,
            deliveryDetails,
            paymentDetails,
            templateName: ORDER_COMPLETE
        });
    } catch (err) {
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
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
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

export const mapAddress = (deliveryDetails): string | null => {
    const addressArray: string[] = [];
    if (deliveryDetails?.forename && deliveryDetails?.surname) {
        addressArray.push(deliveryDetails?.forename + " " + deliveryDetails?.surname);
    }
    if (deliveryDetails?.addressLine1) {
        addressArray.push(deliveryDetails?.addressLine1);
    }
    if (deliveryDetails?.addressLine2) {
        addressArray.push(deliveryDetails?.addressLine2);
    }
    if (deliveryDetails?.locality) {
        addressArray.push(deliveryDetails?.locality);
    }
    if (deliveryDetails?.postalCode) {
        addressArray.push(deliveryDetails?.postalCode);
    }
    if (deliveryDetails?.region) {
        addressArray.push(deliveryDetails?.region);
    }
    if (deliveryDetails?.country) {
        addressArray.push(deliveryDetails?.country);
    }
    return addressArray.length === 0 ? null : addressArray.reduce((accum, value) => accum + "<br/>" + value);
};

export const mapDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
    if (itemOptions?.deliveryTimescale === "standard") {
        return "Standard delivery (dispatched within 4 working days)";
    }
    if (itemOptions?.deliveryTimescale === "same-day") {
        return "Same Day";
    }
    return null;
};

export const mapIncludedOnCertificate = (itemOptions: Record<string, any>): string | null => {
    const includedOnCertificate: string[] = [];
    if (itemOptions?.includeGoodStandingInformation === true) {
        includedOnCertificate.push("Statement of good standing");
    }
    if (itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType?.length !== 0) {
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
    return includedOnCertificate.length === 0 ? null : includedOnCertificate.reduce((accum, value) => accum + "<br/>" + value);
};
