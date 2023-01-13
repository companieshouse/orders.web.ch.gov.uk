import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Basket, Checkout, BasketLinks } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { createLogger } from "ch-structured-logging";
import { HttpError } from "http-errors";

import { checkoutBasket, createPayment, getBasket, getBasketLinks, removeBasketItem } from "../client/api.client";
import { ORDER_COMPLETE, replaceOrderId, BASKET as BASKET_URL, ADD_ANOTHER_DOCUMENT_PATH, CONTINUE_TO_PAYMENT_PATH } from "../model/page.urls";
import { APPLICATION_NAME, CHS_URL, VIEW_BASKET_MATOMO_EVENT_CATEGORY } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import * as templatePaths from "../model/template.paths";
import { BASKET } from "../model/template.paths";
import { BasketItemsMapper } from "../mappers/BasketItemsMapper";
import { BasketLink, getBasketLimit, getBasketLink } from "../utils/basket.util"
import { BasketLimit, BasketLimitState } from "../model/BasketLimit";
import { mapPageHeader } from "../utils/page.header.utils";
import { PageHeader } from "../model/PageHeader";

const logger = createLogger(APPLICATION_NAME);

const PAYMENT_REQUIRED_HEADER = "X-Payment-Required";

const serviceName = `Basket`;
const serviceUrl = `${CHS_URL}/basket`;

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];
        const basketResource: Basket = await getBasket(accessToken);
        const basketLink: BasketLink = await getBasketLink(req, basketResource);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);
        const isDeliveryAddressPresentForDeliverables: boolean = deliverableItemsHaveAddressCheck(basketResource);
        const addAnotherDocumentPath = `${BASKET_URL}${ADD_ANOTHER_DOCUMENT_PATH}`;
        let addAnotherDocumentUrl = `${CHS_URL}${addAnotherDocumentPath}`;
        const continueToPaymentPath = `${BASKET_URL}${CONTINUE_TO_PAYMENT_PATH}`;
        const continueToPaymentUrl = `${CHS_URL}${continueToPaymentPath}`;
        const pageHeader = mapPageHeader(req);
        
        if (req.url === addAnotherDocumentPath) {
            logger.debug(`Add another button clicked, req.url = ${req.url}`);
            if (displayBasketLimitError(req, res, basketLimit)) {
                logger.debug(`Disable Add another document button.`);
                addAnotherDocumentUrl = "";
            } else {
                return;
            }
        } 

        if (req.url === continueToPaymentPath) {
            await proceedToPayment(req, res, next);
            return;
        }

        if (basketResource.enrolled) {
            logger.debug(`User [${userId}] is enrolled; rendering basket page...`);
            res.render(BASKET, {
                ...new BasketItemsMapper().mapBasketItems(basketResource),
                templateName: VIEW_BASKET_MATOMO_EVENT_CATEGORY,
                addAnotherDocumentUrl,
                continueToPaymentUrl,
                ...basketLink,
                ...basketLimit,
                isDeliveryAddressPresentForDeliverables,
                ...pageHeader
            });
        } else {
            logger.debug(`User [${userId}] is not enrolled; proceeding to payment...`);
            await proceedToPayment(req, res, next);
        }
    } catch (err) {
        logger.error(`Error: ${err} handling ${req.path}.`);
        if (err instanceof HttpError) {
            const statusCode: number = err?.statusCode || 500;
            let template: string = templatePaths.ERROR;
            const errorMessage: string = err?.message || "";
            if (statusCode === 409 && err?.message?.includes("Delivery details missing for postal delivery")) {
                template = templatePaths.ERROR_START_AGAIN;
            }
            const pageHeader: PageHeader = mapPageHeader(req);
            res.status(statusCode).render(template,
                {
                    errorMessage,
                    templateName: VIEW_BASKET_MATOMO_EVENT_CATEGORY,
                    ...pageHeader,
                    serviceName,
                    serviceUrl
                });
        } else {
            next(err);
        }
    }
};

const proceedToPayment = async (req: Request, res: Response, next: NextFunction) => {
    const signInInfo = req.session?.data[SessionKey.SignInInfo];
    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
    const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

    const checkoutApiResponse: ApiResponse<Checkout> = await checkoutBasket(accessToken);

    const checkoutId = checkoutApiResponse.resource?.reference;
    logger.info(`Checkout created, checkout_id=${checkoutId}, user_id=${userId}`);

    // for unknown reasons, the sdk brings X-Payment-Required come back as x-payment-required
    const paymentRequired = Object.keys(checkoutApiResponse?.headers as Array<String>)
        .find((header: string) => header.toLowerCase() === PAYMENT_REQUIRED_HEADER.toLowerCase());

    if (paymentRequired) {
        const paymentUrl = checkoutApiResponse?.headers?.[paymentRequired];
        logger.info(`Payment is required, checkout_id=${checkoutId}, user_id=${userId}`);
        const paymentResponse = await createPayment(accessToken, paymentUrl, checkoutApiResponse.resource?.reference!);

        const paymentRedirectUrl = paymentResponse.resource?.links.journey!;
        logger.info(`Payment session created, redirecting to ${paymentRedirectUrl}, reference=${paymentResponse.resource?.reference}, amount=${paymentResponse.resource?.amount}, user_id=${userId}`);
        res.redirect(paymentRedirectUrl + "?summary=false");
    } else {
        logger.info(`Payment is not required, order_id=${checkoutId}, user_id=${userId}`);
        res.redirect(replaceOrderId(ORDER_COMPLETE, checkoutApiResponse.resource?.reference!));
    }
};

export const handleRemovePostback = async (req: Request, res: Response, next: NextFunction) => {
    const signInInfo = req.session?.data[SessionKey.SignInInfo];
    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
    const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

    const itemId = req.params.itemId;

    const basketLinksResponse: BasketLinks = await getBasketLinks(accessToken);

    const itemUri = basketLinksResponse.data.items?.find(item => item.itemUri.includes(itemId));

    if (!itemUri) {
        logger.info(`Could not find a match for itemId and itemUri, user_id=${userId}`);
    } else {
        const response: ApiResponse<any> = await removeBasketItem(itemUri, accessToken);
        logger.info(`Remove basket item response status=${response.httpStatusCode}, user_id=${userId}`);
    }
    return res.redirect(BASKET_URL);
};

const deliverableItemsHaveAddressCheck = (basketResource: Basket): boolean => {
    let certificateCount: number = 0;
    let certifiedCopyCount: number = 0;
    if (basketResource.deliveryDetails === undefined || Object.keys(basketResource.deliveryDetails).length === 0) {
        if (basketResource.items !== undefined) {
            for (const item of basketResource.items) {
                if (item.itemUri.startsWith("/orderable/certificates")) {
                    certificateCount++;
                }
                if (item.itemUri.startsWith("/orderable/certified-copies")) {
                    certifiedCopyCount++;
                }
            }
        }
    }
    return certificateCount > 0 || certifiedCopyCount > 0;
};


/**
 * displayBasketLimitError controls the presentation of a basket limit warning/error as appropriate.
 * @return whether a basket limit error is to be displayed (<code>true</code>), or not (<code>false</code>)
 */
const displayBasketLimitError = (req: Request,
                                 res: Response,
                                 basketLimit: BasketLimit): boolean => {
   if (basketLimit.basketLimitState == BasketLimitState.BELOW_LIMIT) {
       const nextPage = `${CHS_URL}`;
       logger.debug(`Basket is not full, redirecting to ${nextPage}`);
       res.redirect(nextPage);
       return false;
    } else {
        logger.debug(`Basket is full, display error.`);
        basketLimit.basketLimitState = BasketLimitState.DISPLAY_LIMIT_ERROR; // styles button as disabled
        return true;
    }
}