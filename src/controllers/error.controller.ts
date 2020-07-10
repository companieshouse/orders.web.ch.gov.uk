import { Request, Response, NextFunction } from "express";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../config/config";
import * as templatePaths from "../model/template.paths";

const logger = createLogger(APPLICATION_NAME);

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    logger.error("Page not found: " + `${req.path}`);
    return res.status(404).render(templatePaths.ERROR_NOT_FOUND);
};

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    res.status(500).render(templatePaths.ERROR, { errorMessage: err });
};

export default [notFoundHandler, errorHandler];
