import Entity from './entity';
import Skill, { SkillFactory } from './skill';

export default class Pet extends Entity {
    static __type = 'pet';
    skills: Skill[];
    maxHp: number;
    hp: number;
    catchTime: number;
    dv: number;
    constructor(petInfo: PetInfo) {
        super();
        if (petInfo) {
            [this.id, this.name, this.catchTime, this.maxHp, this.hp, this.dv, this.skills] = [
                petInfo.id,
                petInfo.name,
                petInfo.catchTime,
                petInfo.maxHp,
                petInfo.hp,
                petInfo.dv,
                (() => {
                    let skills = [...petInfo.skillArray];
                    petInfo.hideSKill && skills.push(petInfo.hideSKill);
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
    formatByCatchtimeAsync: async (ct: number) => {
        const petInfo: PetInfo = await PetManager.UpdateBagPetInfoAsynce(ct);
        return new Pet(petInfo);
    },
};
