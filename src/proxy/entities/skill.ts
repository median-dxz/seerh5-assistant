import Entity from './entity.js';

export default class Skill extends Entity {
    __type = 'skill';
    elementId;
    category;
    power;
    priority;
    accuracy;
    pp;
    maxPP;
    effects;
    mustHit;
    constructor(skillLike) {
        super();
        if (typeof skillLike == 'object' && skillLike) {
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
                this.effects,
                this.mustHit,
            ] = [
                skillLike.ID,
                skillLike.Name,
                skillLike.Type,
                skillLike.Category,
                skillLike.Power ? skillLike.Power : 0,
                skillLike.Priority ? skillLike.Priority : undefined,
                skillLike.Accuracy,
                skillLike.pp,
                skillLike.MaxPP,
                [skillLike.SideEffect, skillLike.SideEffectArg],
                skillLike.MustHit ? true : false,
            ];
            const argSplit = (arg) => {
                if (arg !== undefined && typeof arg == 'string') {
                    return arg.split(' ').map((v) => parseInt(v));
                } else {
                    return [];
                }
            };
            this.effects = [argSplit(this.effects[0]), argSplit(this.effects[1])];
        }
    }

    get describe() {
        let set = new Set(this.effects[0].map((v) => 1000000 + v));
        let des = '';
        let p = 0;
        for (let effect of SkillXMLInfo.SKILL_OBJ.SideEffects.SideEffect) {
            if (set.has(effect.ID)) {
                let rep = String(effect.des);
                let result = rep.match(/[a-z]/);

                while (result) {
                    rep = rep.replace(result[0], this.effects[1][p++]);
                    result = rep.match(/[a-z]/);
                }

                des += rep;
            }
        }
        return des;
    }

    get element() {
        return SkillXMLInfo.typeMap[SkillXMLInfo.getTypeID(this.id)];
    }

    get categoryName() {
        return SkillXMLInfo.getCategoryName(this.id);
    }
}

export const SkillFactory = {
    formatById: (id) => {
        const obj = SkillXMLInfo.getSkillObj(id);
        return new Skill(obj);
    },
};
