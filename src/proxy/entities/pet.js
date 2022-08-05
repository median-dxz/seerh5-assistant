import Entity from './entity.js';
import Skill from './skill.js';

export default class Pet extends Entity {
    type = 'pet';
    element;
    skills;
    maxHp;
    hp;
    catchTime;
    location;
    constructor(e) {
        super();
        if (typeof e == 'object' && e != null) {
            [this.id, this.name, this.catchTime, this.maxHp, this.hp, this.element, this.skills] = [
                e.id,
                e.name,
                e.catchTime,
                e.maxHp,
                e.hp,
                PetXMLInfo.getType(e.id),
                (() => {
                    let skills = [...e.skillArray];
                    e.hideSKill && skills.push(e.hideSKill);
                    return skills.map((v, i) => {
                        const skill = new Skill(v._id);
                        skill.pp = v.pp;
                        return skill;
                    });
                })(),
            ];
        }
    }
}
