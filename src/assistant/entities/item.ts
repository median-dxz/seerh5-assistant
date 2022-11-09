import Entity from './entity';

export default class Item extends Entity {
    static __type = 'Item';
    amount() {
        return ItemManager.getNumByID(this.id);
    }
    constructor(itemLike: SAType.ItemObj) {
        super();
        [this.id, this.name] = [itemLike.ID, itemLike.Name];
    }
}
