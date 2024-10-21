import { Request, Response, NextFunction } from "express";
import { createLogger } from "@companieshouse/structured-logging-node";
import { HttpError } from "http-errors";

import { APPLICATION_NAME, CHS_URL } from "../config/config";
import * as templatePaths from "../model/template.paths";
import { PageHeader } from "../model/PageHeader";
import { mapPageHeader } from "../utils/page.header.utils";
import { CsrfError } from '@companieshouse/web-security-node';

const logger = createLogger(APPLICATION_NAME);
const serviceName = "Find and update company information";
const serviceUrl = CHS_URL;

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    logger.error("Page not found: " + `${req.path}`);
    const pageHeader: PageHeader = mapPageHeader(req);
    return res.status(404).render(templatePaths.ERROR, { ...pageHeader, serviceName, serviceUrl });
};

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const errorName = err instanceof HttpError ? err?.name : "Error";
    logger.error(`Error: ${err} handling ${req.path}.`);
    const pageHeader: PageHeader = mapPageHeader(req);
    res.status(500).render(templatePaths.ERROR, { errorMessage: errorName, ...pageHeader, serviceName, serviceUrl });
};

const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: NextFunction) => {
    // Handle non-CSRF Errors immediately
    if (!(err instanceof CsrfError)) {
      return next(err);
    }

    const pageHeader: PageHeader = mapPageHeader(req);
    return res.status(403).render(templatePaths.ERROR, {
        errorMessage: err,
        ...pageHeader,
        serviceName,
        serviceUrl
    });
};

export default [csrfErrorHandler, notFoundHandler, errorHandler];
