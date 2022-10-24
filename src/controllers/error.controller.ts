import { Request, Response, NextFunction } from "express";
import { createLogger } from "ch-structured-logging";
import { HttpError } from "http-errors";

import { APPLICATION_NAME, CHS_URL, ORDERS_MATOMO_EVENT_CATEGORY } from "../config/config";
import * as templatePaths from "../model/template.paths";

const logger = createLogger(APPLICATION_NAME);
const serviceName = "Find and update company information";
const serviceUrl = CHS_URL;

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    logger.error("Page not found: " + `${req.path}`);
    return res.status(404).render(templatePaths.ERROR_NOT_FOUND,
        { serviceName, serviceUrl, matomoEventCategory: ORDERS_MATOMO_EVENT_CATEGORY });
};

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const errorName = err instanceof HttpError ? err?.name : "Error";
    logger.error("Error: " + `${req.path}`);
    res.status(500).render(templatePaths.ERROR,
        { errorMessage: errorName, serviceName, serviceUrl, matomoEventCategory: ORDERS_MATOMO_EVENT_CATEGORY });
};

export default [notFoundHandler, errorHandler];
