import { delay } from '../common';
import { Pet, Skill } from '../entity';
import type { MoveModule } from './manager';
import { Operator } from './operator';
import { Provider } from './provider';

class SkillNameMatch {
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

class DiedSwitchLink {
    petNames: string[] = [];
    constructor(names: string[]) {
        this.petNames = names;
    }
    /**
     * @returns 匹配失败返回 -1
     */
    match(pets: Pet[], dyingCt: number) {
        let swName = '';
        for (let pet of pets) {
            if (pet.catchTime === dyingCt) {
                swName = pet.name;
                break;
            }
        }
        if (!this.petNames.includes(swName)) return -1;
        swName = this.petNames[this.petNames.indexOf(swName) + 1];
        for (let i = 1; i < pets.length; i++) {
            const pet = pets[i];
            if (pet.name === swName) {
                if (pet.hp === 0) {
                    return -1;
                } else {
                    return i;
                }
            }
        }
        return -1;
    }
}

function generateStrategy(_snm: string[], _dsl: string[]): MoveModule {
    return async (round, skills, pets) => {
        const snm = new SkillNameMatch(_snm);
        const dsl = new DiedSwitchLink(_dsl);
        if (round.isDiedSwitch) {
            const r = dsl.match(pets, round.self!.catchtime);
            if (r !== -1) {
                Operator.switchPet(r);
            } else {
                Operator.auto();
            }
            await delay(600);
            skills = Provider.getCurSkills()!;
        }
        const r = snm.match(skills);
        if (r) {
            Operator.useSkill(r);
        } else {
            Operator.auto();
        }
    };
}

const defaultStrategy = {
    switchNoBlood: async () => {
        Operator.auto();
    },
    useSkill: async () => {
        // if (!FighterModelFactory.playerMode) {
        Operator.auto();
        //     return;
        // }
        // const {skillPanel} = FighterModelFactory.playerMode.subject.array[1];
        // skillPanel.auto();
    },
};

export { DiedSwitchLink, SkillNameMatch, generateStrategy };
