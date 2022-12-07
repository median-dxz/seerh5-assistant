import Skill from '../entities/skill';
import { PetSwitchInfo } from './infoprovider';

class NameMatched {
    skillNames: string[] = [];
    constructor(names: string[]) {
        this.skillNames = names;
    }
    match(skills: Skill[]) {
        let r = this.skillNames.find((name) => {
            return skills.some((v) => v.name === name && v.pp > 0);
        });
        return r && skills.find((v) => v.name === r)!.id;
    }
}

class DiedSwitchLinked {
    petNames: string[] = [];
    constructor(names: string[]) {
        this.petNames = names;
    }
    /**
     * @returns 匹配失败返回 -1
     */
    match(pets: PetSwitchInfo[], dyingCt: number) {
        let swName = '';
        for (let pet of pets) {
            if (pet.catchTime === dyingCt) {
                swName = pet.name;
                break;
            }
        }
        if (!this.petNames.includes(swName)) return -1;
        swName = this.petNames[this.petNames.indexOf(swName) + 1];
        for (let pet of pets) {
            if (pet.name === swName) {
                if (pet.hp === 0) {
                    return -1;
                } else {
                    return pet.index;
                }
            }
        }
        return -1;
    }
}

export { DiedSwitchLinked, NameMatched };

// const nms = new NameMatched(['鬼哭神泣灭', '幻梦芳逝', '剑挥四方']);
// const dsp = new DiedSwitchLinked(['神寂·克罗诺斯', '蒂朵', '六界帝神']);

// const ReboundDamageModule = (executor) => {
//     return () => {};
// };

// export default ReboundDamageModule;
