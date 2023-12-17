import { EntityBase, type EntityType } from './EntityBase.js';
import { PetElement } from './PetElement.js';
import { Skill } from './Skill.js';

const testPetObjectType = (o: seerh5.PetLike): o is seerh5.PetObj => Object.hasOwn(o, 'ID');

const testPetInfoType = (o: seerh5.PetLike): o is PetInfo => Object.hasOwn(o, 'nature');

const testPetStorage2015PetInfoType = (o: seerh5.PetLike): o is PetStorage2015PetInfo => Object.hasOwn(o, 'posi');

export class Pet extends EntityBase {
    readonly __type: EntityType = 'Pet';
    readonly id: number;
    readonly name: string;
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

    readonly unwrapped_effect?: Array<PetEffectInfo>;
    readonly hideSkillActivated?: boolean;

    get hasEffect(): boolean {
        return Boolean(EffectIconControl._hashMapByPetId.getValue(this.id));
    }

    constructor(obj: PetInfo) {
        super();
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

        if (SkillXMLInfo.hideMovesMap[this.id]) {
            this.hideSkillActivated = Boolean(obj.hideSKill);
        }

        if (obj.effectList && obj.effectList.length > 0) {
            this.unwrapped_effect = obj.effectList;
        }
    }

    static from(obj: seerh5.PetLike) {
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

    static inferCatchTime(obj: Exclude<seerh5.PetLike, seerh5.PetObj> | Pet | number) {
        if (typeof obj === 'number') {
            return obj;
        }

        if ('catchTime' in obj) {
            return obj.catchTime;
        }

        return undefined as never;
    }
}
