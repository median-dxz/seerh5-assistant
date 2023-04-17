import { EntityBase, type EntityType } from './EntityBase';
import { PetElement } from './PetElement';
import { Skill } from './Skill';

export interface IPetObject {
    id: number;
    name: string;
}

const testPetObjectType = (o: SAType.PetLike): o is SAType.PetObj => {
    return Object.hasOwn(o, 'ID');
};

const testPetInfoType = (o: SAType.PetLike): o is PetInfo => {
    return Object.hasOwn(o, 'nature');
};

const testPetStorage2015PetInfoType = (o: SAType.PetLike): o is PetStorage2015PetInfo => {
    return Object.hasOwn(o, 'posi');
};

export class Pet extends EntityBase implements IPetObject {
    __type: EntityType = 'Pet';
    static readonly key = 'id';
    static readonly instanceKey = 'catchTime';
    readonly skills: Skill[];
    readonly maxHp: number;
    readonly hp: number;
    readonly catchTime: number;
    readonly dv: number;
    readonly element: PetElement;
    readonly nature: number;
    constructor(obj: SAType.PetLike) {
        super();
        if (testPetInfoType(obj)) {
            [this.id, this.name, this.catchTime, this.dv, this.element, this.nature, this.hp, this.maxHp] = [
                obj.id,
                obj.name,
                obj.catchTime,
                obj.dv,
                PetElement.formatById(PetXMLInfo.getType(obj.id)),
                obj.nature,
                obj.hp,
                obj.maxHp,
            ];

            this.skills = [...obj.skillArray, obj.hideSKill].filter(Boolean).map((v) => {
                const o = Skill.formatById(v.id);
                o.pp = v.pp;
                return o;
            });
        } else if (testPetObjectType(obj)) {
            [this.id, this.name, this.element] = [obj.ID, obj.DefName, PetElement.formatById(obj.Type)];
        } else if (testPetStorage2015PetInfoType(obj)) {
            [this.id, this.name, this.catchTime, this.element] = [
                obj.id,
                obj.name,
                obj.catchTime,
                PetElement.formatById(obj.type),
            ];
        } else {
            [this.id, this.name, this.catchTime] = [obj.id, obj.name, obj.catchTime];
        }
    }
}
