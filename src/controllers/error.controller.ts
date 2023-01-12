import { Request, Response, NextFunction } from "express";
import { createLogger } from "ch-structured-logging";
import { HttpError } from "http-errors";

import { APPLICATION_NAME, CHS_URL } from "../config/config";
import * as templatePaths from "../model/template.paths";
import { PageHeader } from "../model/PageHeader";
import { mapPageHeader } from "../utils/page.header.utils";

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

export default [notFoundHandler, errorHandler];
