import { Entity, type EntityType } from './Entity';

type SkillEffects = [number[], number[]];
type SkillEffectArgs = string | number | undefined;

interface ISkillObject {
    id: number;
    element: number;
    category: number;
    power: number;
    priority: number;
    accuracy: number;
    maxPP: number;
    effects: SkillEffects;
    mustHit: boolean;
}

export default class Skill extends Entity implements ISkillObject {
    static readonly key = 'id';
    static readonly instanceKey = 'id';
    readonly __type: EntityType = 'Skill';
    element: number;
    category: number;
    power: number;
    priority: number;
    accuracy: number;
    pp: number;
    maxPP: number;
    effects: SkillEffects;
    mustHit: boolean;

    constructor(obj: SAType.MoveObj) {
        super();
        let tempEffects: [SkillEffectArgs, SkillEffectArgs];
        if (obj) {
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
                obj.Type,
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
                    return arg.split(' ').map(parseInt);
                } else if (typeof arg === 'number') {
                    return [arg];
                } else {
                    return [];
                }
            };
            this.effects = tempEffects.map(argSplit) as SkillEffects;
        }
    }

    static formatById(id: number) {
        const obj = SkillXMLInfo.getSkillObj(id);
        if (obj) {
            return new Skill(obj);
        } else {
            throw new Error('暂不支持解析技能石, 或者id有误');
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
}

export type { ISkillObject };
export { Skill };

