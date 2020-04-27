import { Router, Response, NextFunction, Request } from "express";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import { render as renderBasket } from "../controllers/basket.controller";

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
    return res.render(template, { templateName: template });
};

const router: Router = Router();

router.get(pageUrls.ORDERS, renderTemplate(templatePaths.BLANK));
router.get(pageUrls.ORDER_COMPLETE, renderTemplate(templatePaths.ORDER_COMPLETE));
router.get(pageUrls.BASKET, renderBasket);

export default router;
