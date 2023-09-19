import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Basket, BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { getBasket, patchBasket } from "../client/api.client";
import { BASKET } from "../model/page.urls";
import { DELIVERY_DETAILS } from "../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { deliveryDetailsValidationRules, validate } from "../utils/delivery-details-validation";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { APPLICATION_NAME } from "../config/config";
import { BasketLink, getBasketLink } from "../utils/basket.util";
import { mapPageHeader } from "../utils/page.header.utils";

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";
const COMPANY_NAME_FIELD: string = "companyName";
const ADDRESS_LINE_ONE_FIELD: string = "addressLineOne";
const ADDRESS_LINE_TWO_FIELD: string = "addressLineTwo";
const ADDRESS_TOWN_FIELD: string = "addressTown";
const ADDRESS_COUNTY_FIELD: string = "addressCounty";
const ADDRESS_POSTCODE_FIELD: string = "addressPostcode";
const ADDRESS_COUNTRY_FIELD: string = "addressCountry";
const PAGE_TITLE: string = "Delivery details - Order a certificate - GOV.UK";
const HEADING_TEXT: string = "Order a document";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const basket: Basket = await getBasket(accessToken);
        const basketLink: BasketLink = await getBasketLink(req, basket);
        const pageHeader = mapPageHeader(req);
        return res.render(DELIVERY_DETAILS, {
            firstName: basket.deliveryDetails?.forename,
            lastName: basket.deliveryDetails?.surname,
            companyName: basket.deliveryDetails?.companyName,
            addressLineOne: basket.deliveryDetails?.addressLine1,
            addressLineTwo: basket.deliveryDetails?.addressLine2,
            addressCountry: basket.deliveryDetails?.country,
            addressTown: basket.deliveryDetails?.locality,
            addressPoBox: basket.deliveryDetails?.poBox,
            addressPostcode: basket.deliveryDetails?.postalCode,
            addressCounty: basket.deliveryDetails?.region,
            templateName: DELIVERY_DETAILS,
            pageTitleText: PAGE_TITLE,
            serviceName: HEADING_TEXT,
            ...basketLink,
            ...pageHeader
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const route = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const errorList = validate(errors);
    const firstName: string = req.body[FIRST_NAME_FIELD];
    const lastName: string = req.body[LAST_NAME_FIELD];
    const companyName: string = req.body[COMPANY_NAME_FIELD];
    const addressLineOne: string = req.body[ADDRESS_LINE_ONE_FIELD];
    const addressLineTwo: string = req.body[ADDRESS_LINE_TWO_FIELD];
    const addressTown: string = req.body[ADDRESS_TOWN_FIELD];
    const addressCounty: string = req.body[ADDRESS_COUNTY_FIELD];
    const addressPostcode: string = req.body[ADDRESS_POSTCODE_FIELD];
    const addressCountry: string = req.body[ADDRESS_COUNTRY_FIELD];

    const signInInfo = req.session?.data[SessionKey.SignInInfo];
    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
    const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
    const pageHeader = mapPageHeader(req);
    if (!errors.isEmpty()) {
        return res.render(DELIVERY_DETAILS, {
            ...errorList,
            addressCountry,
            addressCounty,
            addressLineOne,
            addressLineTwo,
            addressPostcode,
            addressTown,
            firstName,
            lastName,
            companyName,
            pageTitleText: PAGE_TITLE,
            templateName: (DELIVERY_DETAILS),
            backLink: BASKET,
            serviceName: HEADING_TEXT,
            ...pageHeader
        });
    }
    try {
        const basketDeliveryDetails: BasketPatchRequest = {
            deliveryDetails: {
                addressLine1: addressLineOne,
                addressLine2: addressLineTwo || null,
                companyName: companyName || null,
                country: addressCountry,
                forename: firstName,
                locality: addressTown,
                postalCode: addressPostcode || null,
                region: addressCounty || null,
                surname: lastName
            }
        };
        await patchBasket(accessToken, basketDeliveryDetails);
        logger.info(`Patched basket with delivery details, certificate_id=${req.params.certificateId}, user_id=${userId}`);
        return res.redirect(BASKET);
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export default [...deliveryDetailsValidationRules, route];
