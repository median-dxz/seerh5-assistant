import Entity from './entity';

export default class Item extends Entity {
    __type = 'Item';
    amount() {
        return ItemManager.getNumByID(this.id);
    }
    constructor(itemLike: ItemInfo & object) {
        super();
        [this.id, this.name] = [itemLike.ID, itemLike.Name];
    }
}
