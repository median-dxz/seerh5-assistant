import { EntityBase, type EntityType } from './EntityBase.js';

export interface IItemObject {
    id: number;
    name: string;
    limit?: number;
}

export class Item extends EntityBase implements IItemObject {
    declare readonly __type: EntityType;
    limit?: number;
    amount?: number;

    constructor(obj: seerh5.ItemObj) {
        super();
        this.__type = 'Item';
        [this.id, this.name, this.limit] = [obj.ID, obj.Name, obj.Max];
    }
}
