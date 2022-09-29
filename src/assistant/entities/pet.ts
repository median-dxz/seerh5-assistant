import Entity from './entity';
import Skill, { SkillFactory } from './skill';

export default class Pet extends Entity {
    __type = 'pet';
    skills: Skill[];
    maxHp: number;
    hp: number;
    catchTime: number;
    dv: number;
    constructor(petLike: PetInfo) {
        super();
        if (petLike) {
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
    formatByCatchtime: (ct: number) => {
        return new Pet(PetManager.getPetInfo(ct));
    },
};
