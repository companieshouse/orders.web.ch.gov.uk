import { Basket, DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { ItemVisitor } from "./ItemVisitor";
import { VisitableItem } from "./VisitableItem";
import { BasketDetailsViewModel } from "./BasketDetailsViewModel";
import { MapUtil } from "../service/MapUtil";

export class BasketItemsMapper {

    public mapBasketItems(basketResource: Basket): BasketDetailsViewModel {
        const viewModel = new BasketDetailsViewModel(MapUtil.getDeliveryDetailsTable(basketResource.deliveryDetails));

        if (!basketResource.items) {
            return viewModel;
        }

        const itemVisitor = new ItemVisitor(viewModel);

        for (const item of basketResource.items) {
            const visitableItem = new VisitableItem(item);
            visitableItem.accept(itemVisitor);
        }
        return viewModel;
    }
}
