import Skill from 'src/assisant/entities/skill';
import { PetSwitchInfos } from '../infoprovider';

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
    match(pets: PetSwitchInfos, dyingCt: number) {
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
