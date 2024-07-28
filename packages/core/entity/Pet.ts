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

    readonly unwrapped_effect?: PetEffectInfo[];
    // 是否存在第五
    readonly hasFifthSkill: boolean;
    // 第五技能, 不存在和未获取时为undefined
    readonly fifthSkill?: Skill;

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
            this.baseMaxHp
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
            obj.base_hp_total
        ];

        if (Array.isArray(obj.skillArray)) {
            this.skills = [...obj.skillArray, obj.hideSKill].filter(Boolean).map((v) => {
                const o = Skill.formatById(v.id);
                o.pp = v.pp;
                return o;
            });
        } else {
            this.skills = [];
        }

        this.hasFifthSkill = Boolean(SkillXMLInfo.hideMovesMap[this.id]);
        this.fifthSkill = Object.hasOwn(obj, 'hideSKill') ? Skill.formatById(obj.hideSKill.id) : undefined;
        if (this.fifthSkill) {
            this.fifthSkill.pp = obj.hideSKill.pp;
        }

        if (obj.effectList && obj.effectList.length > 0) {
            this.unwrapped_effect = obj.effectList;
        }
    }

    // 是否存在魂印
    get hasEffect() {
        return Boolean(EffectIconControl._hashMapByPetId.getValue(this.id));
    }

    /**
     * 查询精灵是否激活魂印
     * @returns 如果激活魂印则返回 true, 否则包括没有魂印在内, 都返回false
     */
    get isEffectActivated() {
        if (!(this.hasEffect && this.unwrapped_effect)) return false;

        let result = false;
        PetManager.checkPetInfoEffect({ id: this.id, effectList: this.unwrapped_effect }, (r) => {
            result = r;
        });

        return result;
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
                level: obj.level
            } as PetInfo);
        } else {
            return new Pet({ ...obj } as PetInfo);
        }
    }

    static inferCatchTime(obj: { catchTime: number } | number) {
        if (typeof obj === 'number') {
            return obj;
        }

        if ('catchTime' in obj) {
            return obj.catchTime;
        }

        return undefined as never;
    }
}
