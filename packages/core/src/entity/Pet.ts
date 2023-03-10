import { Entity, type EntityType } from './Entity';
import Skill from './Skill';

interface IPetObject {
    id: number;
    name: string;
    element: number;
}

const testPetObjectType = (o: SAType.PetLike): o is SAType.PetObj => {
    return Object.hasOwn(o, 'ID');
};

const testPetInfoType = (o: SAType.PetLike): o is PetInfo => {
    return Object.hasOwn(o, 'maxHp');
};

const testPetStorage2015PetInfoType = (o: SAType.PetLike): o is PetStorage2015PetInfo => {
    return Object.hasOwn(o, 'posi');
};

export default class Pet extends Entity implements IPetObject {
    __type: EntityType = 'Pet';
    static readonly key = 'id';
    static readonly instanceKey = 'catchTime';
    skills: Skill[];
    maxHp: number;
    hp: number;
    catchTime: number;
    dv: number;
    element: number;
    nature: number;
    constructor(obj: SAType.PetLike) {
        super();
        if (testPetInfoType(obj)) {
            [this.id, this.name, this.catchTime, this.dv, this.element, this.hp, this.maxHp, this.nature] = [
                obj.id,
                obj.name,
                obj.catchTime,
                obj.dv,
                PetXMLInfo.getType(3673),
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
            [this.id, this.name, this.element] = [obj.ID, obj.DefName, obj.Type];
        } else if (testPetStorage2015PetInfoType(obj)) {
            [this.id, this.name, this.catchTime, this.element] = [obj.id, obj.name, obj.catchTime, obj.type];
        } else {
            [this.id, this.name, this.catchTime] = [obj.id, obj.name, obj.catchTime];
        }
    }
}

export type { IPetObject };
export { Pet };

