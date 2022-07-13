import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Basket, Checkout } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { createLogger } from "ch-structured-logging";
import { HttpError } from "http-errors";

import { checkoutBasket, createPayment, getBasket } from "../client/api.client";
import { ORDER_COMPLETE, replaceOrderId } from "../model/page.urls";
import { APPLICATION_NAME } from "../config/config";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import * as templatePaths from "../model/template.paths";
import { BASKET } from "../model/template.paths";
import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { MapUtil } from "../service/MapUtil";
import { mapFilingHistoriesDocuments } from "../service/map.item.service";
import { ItemOptions as MissingImageDeliveryItemOptions } from "../../../api-sdk-node/dist/services/order/mid";
import { ItemOptions as CertificateItemOptions } from "../../../api-sdk-node/dist/services/order/certificates";
import { ItemOptions as CertifiedCopyItemOptions } from "../../../api-sdk-node/dist/services/order/certified-copies";

const logger = createLogger(APPLICATION_NAME);

const PAYMENT_REQUIRED_HEADER = "X-Payment-Required";

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signInInfo = req.session?.data[SessionKey.SignInInfo];
        const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;
        const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

        const basketResource: Basket = await getBasket(accessToken);

        if (basketResource.enrolled) {
            res.render(BASKET, basketResource.items?.reduce((prev, curr) => {
                if (curr.kind === "item#certificate") {
                    const itemOptions = curr.itemOptions as CertificateItemOptions;
                    prev.certificates.push([
                        {
                            text: MapUtil.mapCertificateType(itemOptions?.certificateType)
                        },
                        {
                            text: curr.companyNumber
                        },
                        {
                            text: MapUtil.mapDeliveryMethod(itemOptions)
                        },
                        {
                            text: `£${curr.totalItemCost}`
                        },
                        {
                            html: `<a class="govuk-link" href="javascript:void(0)">View/Change certificate options</a>`
                        },
                        {
                            html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
                        }
                    ]);
                    prev.hasDeliverableItems = true;
                    if (!prev.deliveryDetailsTable) {
                        prev.deliveryDetailsTable = getDeliveryDetailsTable(basketResource);
                    }
                } else if (curr.kind === "item#certified-copy") {
                    const itemOptions = curr.itemOptions as CertifiedCopyItemOptions;
                    const mappedFilingHistory = mapFilingHistoriesDocuments(itemOptions?.filingHistoryDocuments || []);
                    prev.certifiedCopies.push([
                        {
                            text: mappedFilingHistory[0]?.filingHistoryDate
                        },
                        {
                            text: mappedFilingHistory[0]?.filingHistoryType
                        },
                        {
                            text: mappedFilingHistory[0]?.filingHistoryDescription
                        },
                        {
                            text: curr.companyNumber
                        },
                        {
                            text: MapUtil.mapDeliveryMethod(itemOptions)
                        },
                        {
                            text: `£${curr.totalItemCost}`
                        },
                        {
                            html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
                        }
                    ]);
                    prev.hasDeliverableItems = true;
                    if (!prev.deliveryDetailsTable) {
                        prev.deliveryDetailsTable = getDeliveryDetailsTable(basketResource);
                    }
                } else if (curr.kind === "item#missing-image-delivery") {
                    const itemOptions = curr.itemOptions as MissingImageDeliveryItemOptions;
                    const mappedFilingHistory = mapFilingHistoriesDocuments([itemOptions]);
                    prev.missingImageDelivery.push([
                        {
                            text: mappedFilingHistory[0]?.filingHistoryDate
                        },
                        {
                            text: mappedFilingHistory[0]?.filingHistoryType
                        },
                        {
                            text: mappedFilingHistory[0]?.filingHistoryDescription
                        },
                        {
                            text: curr.companyNumber
                        },
                        {
                            text: `£${curr.totalItemCost}`
                        },
                        {
                            html: `<a class="govuk-link" href="javascript:void(0)">Remove</a>`
                        }
                        ]);
                } else {
                    throw Error(`Unknown item type: [${curr.kind}]`);
                }
                prev.totalItemCost += parseInt(curr.totalItemCost);
                return prev;
            }, {
                certificates: [] as any[][],
                certifiedCopies: [] as any[][],
                missingImageDelivery: [] as any[][],
                totalItemCost: 0,
                deliveryDetailsTable: null,
                hasDeliverableItems: false,
                serviceName: "Basket"
            }));
        } else {
            await proceedToPayment(req, res, next);
        }
    } catch (err) {
        if (err instanceof HttpError) {
            const statusCode: number = err?.statusCode || 500;
            let template: string = templatePaths.ERROR;
            const errorMessage: string = err?.message || "";
            if (statusCode === 409 && err?.message?.includes("Delivery details missing for postal delivery")) {
                template = templatePaths.ERROR_START_AGAIN;
            }
            res.status(statusCode).render(template, { errorMessage });
        } else {
            next(err);
        }
    }
};

export const handlePostback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await proceedToPayment(req, res, next);
    } catch (err) {
        if (err instanceof HttpError) {
            const statusCode: number = err?.statusCode || 500;
            let template: string = templatePaths.ERROR;
            const errorMessage: string = err?.message || "";
            if (statusCode === 409 && err?.message?.includes("Delivery details missing for postal delivery")) {
                template = templatePaths.ERROR_START_AGAIN;
            }
            res.status(statusCode).render(template, { errorMessage });
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

const getDeliveryDetailsTable = (item: { deliveryDetails?: DeliveryDetails }): any => {
    return [
        {
            key: {
                classes: "govuk-!-width-one-half",
                text: "Delivery address"
            },
            value: {
                classes: "govuk-!-width-one-half",
                html: "<p id='deliveryAddressValue'>" + MapUtil.mapDeliveryDetails(item.deliveryDetails) + "</p>"
            },
            actions: {
                items: [{
                    href: "/delivery-details",
                    text: "Change"
                }]
            }
        }
    ];
};
