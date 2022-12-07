import { Router, Response, NextFunction, Request } from "express";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import { render as renderBasket, handlePostback as handleBasketPostback, handleRemovePostback } from "../controllers/basket.controller";
import { render as renderOrderConfirmation } from "../controllers/order.confirmation.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../controllers/delivery.details.controller";
import { OrderSummaryController } from "../order_summary/OrderSummaryController";
import { OrderSummaryService } from "../order_summary/OrderSummaryService";
import { OrderItemSummaryController } from "../order_item_summary/OrderItemSummaryController";
import { ADD_ANOTHER_DOCUMENT_PATH } from "../model/page.urls";

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
    return res.render(template, { templateName: template });
};

const router: Router = Router();

router.get(pageUrls.ORDERS, renderTemplate(templatePaths.BLANK));
router.get(pageUrls.ORDER_COMPLETE, renderOrderConfirmation);
const orderSummaryController = new OrderSummaryController(new OrderSummaryService());
router.get(pageUrls.ORDER_SUMMARY, orderSummaryController.readOrder.bind(orderSummaryController))
const orderItemSummaryController = new OrderItemSummaryController();
router.get(pageUrls.ORDER_ITEM_SUMMARY, orderItemSummaryController.viewSummary.bind(orderItemSummaryController));
router.get(pageUrls.BASKET, renderBasket);
router.get(pageUrls.BASKET + ADD_ANOTHER_DOCUMENT_PATH, renderBasket);
router.post(pageUrls.BASKET, handleBasketPostback);
router.post(pageUrls.BASKET_REMOVE, handleRemovePostback);

router.get(pageUrls.DELIVERY_DETAILS, renderDeliveryDetails);
router.post(pageUrls.DELIVERY_DETAILS, deliveryDetailsController);

export default router;
