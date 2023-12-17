import { EntityBase, type EntityType } from './EntityBase.js';

export class Item extends EntityBase {
    readonly __type: EntityType = 'Item';
    readonly id: number;
    readonly name: string;
    limit?: number;
    amount?: number;

    constructor(obj: seerh5.ItemObj) {
        super();
        [this.id, this.name, this.limit] = [obj.ID, obj.Name, obj.Max];
    }
}
