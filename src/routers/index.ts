import { Router, Response, NextFunction, Request } from "express";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import { render as renderBasket, handlePostback as handleBasketPostback } from "../controllers/basket.controller";
import { render as renderOrderConfirmation } from "../controllers/order.confirmation.controller";

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
    return res.render(template, { templateName: template });
};

const router: Router = Router();

router.get(pageUrls.ORDERS, renderTemplate(templatePaths.BLANK));
router.get(pageUrls.ORDER_COMPLETE, renderOrderConfirmation);
router.get(pageUrls.BASKET, renderBasket);
router.post(pageUrls.BASKET, handleBasketPostback);

export default router;
