import sinon from "sinon";
import chai from "chai";
import BasketService from "ch-sdk-node/dist/services/order/basket/service";

import { checkoutBasket } from "../../client/api.client";
import { Checkout } from "ch-sdk-node/dist/services/order/basket";
import { ApiResponse } from "ch-sdk-node/dist/services/resource";
import { success } from "ch-sdk-node/dist/services/result";
const O_AUTH_TOKEN = "oauth";

describe("api.client", () => {
    describe("checkoutBasket", () => {
        it("should return a Checkout object with headers", async () => {
            const checkoutResponse: ApiResponse<Checkout> = {
                httpStatusCode: 200,
                headers: {
                    "X-Payment-Required": "http://"
                }
            };
            checkoutResponse.resource = { reference: "1234" } as Checkout;
            sinon.stub(BasketService.prototype, "checkoutBasket").returns(Promise.resolve(success(checkoutResponse)));

            const response: ApiResponse<Checkout> = await checkoutBasket(O_AUTH_TOKEN);

            chai.expect(response.headers?.["X-Payment-Required"]).to.equal(checkoutResponse.headers?.["X-Payment-Required"]);
            chai.expect(response.resource?.reference).to.equal(checkoutResponse.resource.reference);
        });
    });
});
