import {Checkout} from "@companieshouse/api-sdk-node/dist/services/order/checkout";
import {AbstractTemplateMapper} from "./ConfirmationTemplateMapper";

export class OrderSummaryTemplateMapper extends AbstractTemplateMapper {
    map (checkout: Checkout): Record<string, any> {
        const orderDetails = this.getOrderDetails(checkout);
        const paymentDetails = this.getPaymentDetails(checkout);
        return {
            pageTitleText: "Order received - GOV.UK",
            orderDetails,
            paymentDetails,
            hasMissingImageDeliveryItems: true,
            hasExpressDeliveryItems: false,
            hasStandardDeliveryItems: false,
            templateName: "order-complete-abbreviated"
        };
    }
}
