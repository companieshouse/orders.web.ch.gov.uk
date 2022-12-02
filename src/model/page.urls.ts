export const ORDERS: string = "/orders";
export const ORDER_SUMMARY: string = "/orders/:orderId";
// ORDER_COMPLETE is currently a dummy url
export const ORDER_COMPLETE: string = "/orders/:orderId/confirmation";
export const BASKET: string = "/basket";
export const BASKET_REMOVE: string = "/basket/remove/:itemId";
export const DELIVERY_DETAILS: string = "/delivery-details";
export const ORDER_ITEM_SUMMARY: string = "/orders/:orderId/items/:itemId";
export const ADD_ANOTHER_DOCUMENT_PATH: string = "/add-another-document";
export const replaceOrderId = (uri: string, orderId: string) => {
    return uri.replace(":orderId", orderId);
};
