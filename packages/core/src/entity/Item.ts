import { Entity, type EntityType } from './Entity';

interface IItemObject {
    id: number;
    name: string;
    limit?: number;
}

export default class Item extends Entity implements IItemObject {
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

