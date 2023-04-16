import { EntityBase, type EntityType } from './EntityBase';

export class PetElement extends EntityBase {
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

    static formatById(id: number) {
        return new PetElement(SkillXMLInfo.typeMap[id]);
    }

    /** 计算克制倍率 */
    calcRatio(b: PetElement | number) {
        if (typeof b === 'number') {
            return TypeXMLInfo.getRelationsPow(this.identifier, PetElement.formatById(b).identifier);
        } else {
            return TypeXMLInfo.getRelationsPow(this.identifier, b.identifier);
        }
    }
}
