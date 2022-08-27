import Entity from './entity';

type SkillEffects = [number[], number[]];
type SkillEffectArgs = string | number | undefined;
export default class Skill extends Entity {
    __type = 'skill';
    elementId: number;
    category: number;
    power: number;
    priority: number;
    accuracy: number;
    pp: number;
    maxPP: number;
    effects: SkillEffects;
    mustHit: boolean;
    constructor(skillLike: PetSkillInfo) {
        super();
        let tempEffects: [SkillEffectArgs, SkillEffectArgs];
        if (skillLike) {
            [
                this.id,
                this.name,
                this.elementId,
                this.category,
                this.power,
                this.priority,
                this.accuracy,
                this.pp,
                this.maxPP,
                tempEffects,
                this.mustHit,
            ] = [
                skillLike.ID,
                skillLike.Name,
                skillLike.Type,
                skillLike.Category,
                skillLike.Power ?? 0,
                skillLike.Priority ?? 0,
                skillLike.Accuracy,
                skillLike.pp,
                skillLike.MaxPP,
                [skillLike.SideEffect, skillLike.SideEffectArg],
                Boolean(skillLike.MustHit),
            ];
            const argSplit = (arg: SkillEffectArgs) => {
                if (typeof arg === 'string') {
                    return arg.split(' ').map((v) => parseInt(v));
                } else if (typeof arg === 'number') {
                    return [arg];
                } else {
                    return [];
                }
            };
            this.effects = tempEffects.map(argSplit) as SkillEffects;
        }
    }

    get describe() {
        return this.effects[0].reduce((pre, v) => {
            const effect = EffectInfoManager.getEffect(v);
            pre += effect.getInfo(this.effects[1].splice(0, effect.argsNum)) + '\n';
            return pre;
        }, '');
    }

    get element() {
        return SkillXMLInfo.typeMap[SkillXMLInfo.getTypeID(this.id)];
    }

    get categoryName() {
        return SkillXMLInfo.getCategoryName(this.id);
    }
}

export const SkillFactory = {
    formatById: (id: number) => {
        const obj = SkillXMLInfo.getSkillObj(id);
        return new Skill(obj);
    },
};
