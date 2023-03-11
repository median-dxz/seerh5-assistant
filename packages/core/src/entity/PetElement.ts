import { EntityBase, type EntityType } from './EntityBase';

class PetElement extends EntityBase {
    __type: EntityType = 'PetElement';
    static readonly key = 'id';
    /** 是否是双属性 */
    composite: boolean;
    /** 英文属性名 */
    identifier: string;
    attr?: [number, number];

    constructor(obj: SAType.ElementObj) {
        super();
        [this.id, this.name, this.identifier, this.composite] = [obj.id, obj.cn, obj.en, Boolean(obj.is_dou)];
        if (this.composite) {
            this.attr = obj.att?.split(' ').map(Number) as [number, number];
        }
    }

    /** 计算克制倍率 */
    calcRatio(b: PetElement) {
        return TypeXMLInfo.getRelationsPow(this.identifier, b.identifier);
    }
}

export { PetElement };

