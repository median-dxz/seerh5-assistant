import type { SkillType } from '../constant/index.js';
import { EntityBase, type EntityType } from './EntityBase.js';
import { PetElement } from './PetElement.js';

type SkillEffects = [number[], number[]];
type SkillEffectArgs = string | number | undefined;

export class Skill extends EntityBase {
    readonly id: number;
    readonly name: string;
    readonly __type: EntityType = 'Skill';
    element: PetElement;
    category: SkillType;
    power: number;
    priority: number;
    accuracy: number;
    pp: number;
    maxPP: number;
    effects: SkillEffects;
    mustHit: boolean;
    stoneSkillId?: number;
    stoneItemId?: number;

    constructor(obj: seerh5.MoveObj) {
        super();
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
            this.mustHit
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
            Boolean(obj.MustHit)
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
                const skill = new Skill({ ...stone, ID: id });
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
            const effect = EffectInfoManager.getEffect(v);
            pre += effect.getInfo(this.effects[1].splice(0, effect.argsNum)) + '\n';
            return pre;
        }, '');
    }

    get categoryName() {
        return SkillXMLInfo.getCategoryName(this.id);
    }

    get isFifth() {
        return Object.values(SkillXMLInfo.hideMovesMap)
            .flat()
            .find((v) => v.id === this.id);
    }
}
