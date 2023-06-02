import { EntityBase, type EntityType } from './EntityBase.js';
import { PetElement } from './PetElement.js';

type SkillEffects = [number[], number[]];
type SkillEffectArgs = string | number | undefined;

export interface ISkillObject {
    id: number;
    category: number;
    power: number;
    priority: number;
    accuracy: number;
    maxPP: number;
    effects: SkillEffects;
    mustHit: boolean;
}

export class Skill extends EntityBase implements ISkillObject {
    static readonly key = 'id';
    static readonly instanceKey = 'id';
    declare readonly __type: EntityType;
    element: PetElement;
    category: number;
    power: number;
    priority: number;
    accuracy: number;
    pp: number;
    maxPP: number;
    effects: SkillEffects;
    mustHit: boolean;
    stoneSkillId?: number;
    stoneItemId?: number;

    constructor(obj: SAType.MoveObj) {
        super();
        this.__type = 'Skill';
        let tempEffects: [SkillEffectArgs, SkillEffectArgs];

        [
            this.id,
            this.name,
            this.element,
            this.category,
            this.power,
            this.priority,
            this.accuracy,
            this.pp,
            this.maxPP,
            tempEffects,
            this.mustHit,
        ] = [
            obj.ID,
            obj.Name,
            PetElement.formatById(obj.Type),
            obj.Category,
            obj.Power ?? 0,
            obj.Priority ?? 0,
            obj.Accuracy,
            obj.pp ?? 0,
            obj.MaxPP,
            [obj.SideEffect, obj.SideEffectArg],
            Boolean(obj.MustHit),
        ];
        const argSplit = (arg: SkillEffectArgs) => {
            if (typeof arg === 'string') {
                return arg.split(' ').map(Number);
            } else if (typeof arg === 'number') {
                return [arg];
            } else {
                return [];
            }
        };
        this.effects = tempEffects.map(argSplit) as SkillEffects;
    }

    static formatById(id: number) {
        const obj = SkillXMLInfo.getSkillObj(id);
        if (obj) {
            return new Skill(obj);
        } else {
            const stoneId = SkillXMLInfo.getStoneBySkill(id);
            const stone = Object.values(SkillXMLInfo.moveStoneMap).find((v) => v.ItemID === stoneId);
            if (stone) {
                const skill = new Skill(stone);
                skill.id = id;
                skill.stoneSkillId = stone.ID;
                skill.stoneItemId = stoneId;
                return skill;
            } else {
                console.error('解析技能失败');
                return {} as Skill;
            }
        }
    }

    get describe() {
        return this.effects[0].reduce((pre, v) => {
            /* eslint-disable */
            const effect = EffectInfoManager.getEffect(v);
            pre += effect.getInfo(this.effects[1].splice(0, effect.argsNum)) + '\n';
            /* eslint-enable */
            return pre;
        }, '');
    }

    get categoryName() {
        return SkillXMLInfo.getCategoryName(this.id);
    }
}
