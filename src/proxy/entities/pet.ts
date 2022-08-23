import Entity from './entity.js';
import Skill, { SkillFactory } from './skill.js';

export default class Pet extends Entity {
    __type = 'pet';
    skills;
    maxHp;
    hp;
    catchTime;
    dv;
    constructor(petLike) {
        super();
        if (typeof petLike == 'object' && petLike) {
            [this.id, this.name, this.catchTime, this.maxHp, this.hp, this.dv, this.skills] = [
                petLike.id,
                petLike.name,
                petLike.catchTime,
                petLike.maxHp,
                petLike.hp,
                petLike.dv,
                (() => {
                    let skills = [...petLike.skillArray];
                    petLike.hideSKill && skills.push(petLike.hideSKill);
                    return skills.map((v) => SkillFactory.formatById(v.id));
                })(),
            ];
        }
    }

    get element() {
        return SkillXMLInfo.typeMap[PetXMLInfo.getType(this.id)];
    }
}

export const PetFactory = {
    formatByCatchtime: (ct) => {
        return new Pet(PetManager.getPetInfo(ct));
    },
};
