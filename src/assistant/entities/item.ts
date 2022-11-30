import Entity from './entity';

export default class Item extends Entity {
    static __type = 'Item';
    limit?: number;
    
    get amount() {
        return ItemManager.getNumByID(this.id);
    }
    constructor(itemLike: SAType.ItemObj) {
        super();
        [this.id, this.name, this.limit] = [itemLike.ID, itemLike.Name, itemLike.Max];
    }
}
