import { Router, Response, NextFunction, Request } from "express";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import { render as renderBasket } from "../controllers/basket.controller";
import { render as renderOrderConfirmation } from "../controllers/order.confirmation.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../controllers/delivery.details.controller";

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
    return res.render(template, { templateName: template });
};

const router: Router = Router();

router.get(pageUrls.ORDERS, renderTemplate(templatePaths.BLANK));
router.get(pageUrls.ORDER_COMPLETE, renderOrderConfirmation);
router.get(pageUrls.BASKET, renderBasket);

router.get(pageUrls.DELIVERY_DETAILS, renderDeliveryDetails);
router.post(pageUrls.DELIVERY_DETAILS, deliveryDetailsController);

export default router;
