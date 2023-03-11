import { EntityBase, type EntityType } from './EntityBase';

interface IItemObject {
    id: number;
    name: string;
    limit?: number;
}

class Item extends EntityBase implements IItemObject {
    static readonly key = 'id';
    static readonly instanceKey = 'id';
    readonly __type: EntityType = 'Item';
    limit?: number;
    amount: number;

    constructor(obj: SAType.ItemObj) {
        super();
        this.__type = 'Item';
        [this.id, this.name, this.limit] = [obj.ID, obj.Name, obj.Max];
    }
}

export type { IItemObject };
export { Item };

