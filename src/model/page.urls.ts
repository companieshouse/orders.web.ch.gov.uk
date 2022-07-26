export const ORDERS: string = "/orders";
// ORDER_COMPLETE is currently a dummy url
export const ORDER_COMPLETE: string = "/orders/:orderId/confirmation";
export const BASKET: string = "/basket";
export const BASKET_REMOVE: string = "/basket/remove/:itemId";
export const DELIVERY_DETAILS: string = "/delivery-details";

export const replaceOrderId = (uri: string, orderId: string) => {
    return uri.replace(":orderId", orderId);
};