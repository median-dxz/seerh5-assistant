import Entity from "./entity.js";

export default class Skill extends Entity {
    type = "skill";
    element;
    category;
    power;
    priority;
    accuracy;
    pp;
    maxPP;
    effects;
    mustHit;
    constructor(e) {
        super();
        let skillObj = SkillXMLInfo.getSkillObj(e);
        if (skillObj != null) {
            [
                this.id,
                this.name,
                this.element,
                this.category,
                this.power,
                this.priority,
                this.accuracy,
                this.maxPP,
                this.effects,
                this.mustHit,
            ] = [
                skillObj.ID,
                skillObj.Name,
                skillObj.Type,
                skillObj.Category,
                skillObj.Power ? skillObj.Power : 0,
                skillObj.Priority ? skillObj.Priority : undefined,
                skillObj.Accuracy,
                skillObj.MaxPP,
                [skillObj.SideEffect, skillObj.SideEffectArg],
                skillObj.MustHit ? true : false,
            ];
        } else {
            this.name = "暂不支持解析技能石";
        }
    }

    get describe() {
        let set = new Set(this.effects[0].map((v) => 1000000 + v));
        let des = "";
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

    getElName = () => SkillXMLInfo.getTypeCN(this.id);
    getCategoryName = () => SkillXMLInfo.getCategoryName(this.category);
}
