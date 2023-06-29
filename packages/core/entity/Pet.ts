import { EntityBase, type EntityType } from './EntityBase.js';
import { PetElement } from './PetElement.js';
import { Skill } from './Skill.js';

export interface IPetObject {
    id: number;
    name: string;
}

const testPetObjectType = (o: SAType.PetLike): o is SAType.PetObj => Object.hasOwn(o, 'ID');

const testPetInfoType = (o: SAType.PetLike): o is PetInfo => Object.hasOwn(o, 'nature');

const testPetStorage2015PetInfoType = (o: SAType.PetLike): o is PetStorage2015PetInfo => Object.hasOwn(o, 'posi');

export class Pet extends EntityBase implements IPetObject {
    readonly __type: EntityType;
    static readonly key = 'id';
    static readonly instanceKey = 'catchTime';
    readonly skills: Skill[];
    readonly catchTime: number;
    readonly level: number;
    readonly dv: number;
    readonly element: PetElement;
    readonly nature: number;
    readonly hp: number;
    readonly maxHp: number;

    readonly baseCurHp: number;
    readonly baseMaxHp: number;

    constructor(obj: PetInfo) {
        super();
        this.__type = 'Pet';

        [
            this.id,
            this.name,
            this.catchTime,
            this.level,
            this.dv,
            this.element,
            this.nature,
            this.hp,
            this.maxHp,
            this.baseCurHp,
            this.baseMaxHp,
        ] = [
            obj.id,
            obj.name,
            obj.catchTime,
            obj.level,
            obj.dv,
            PetElement.formatById(PetXMLInfo.getType(obj.id)),
            obj.nature,
            obj.hp,
            obj.maxHp,
            obj.base_curHp,
            obj.base_hp_total,
        ];

        this.skills = [...obj.skillArray, obj.hideSKill].filter(Boolean).map((v) => {
            const o = Skill.formatById(v.id);
            o.pp = v.pp;
            return o;
        });
    }

    static from(obj: SAType.PetLike) {
        if (testPetInfoType(obj)) {
            return new Pet(obj);
        } else if (testPetObjectType(obj)) {
            return new Pet({ id: obj.ID, name: obj.DefName } as PetInfo);
        } else if (testPetStorage2015PetInfoType(obj)) {
            return new Pet({
                id: obj.id,
                name: obj.name,
                catchTime: obj.catchTime,
                level: obj.level,
            } as PetInfo);
        } else {
            return new Pet({ ...obj } as PetInfo);
        }
    }
}
