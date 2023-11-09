import { delay } from '../common/utils.js';
import type { Pet, Skill } from '../entity/index.js';
import type { MoveStrategy } from './manager.js';
import { Manager } from './manager.js';
import { Operator } from './operator.js';
import { Provider } from './provider.js';

export class SkillNameMatch {
    skillNames: string[] = [];
    constructor(names: string[]) {
        this.skillNames = names;
    }
    match(skills: Skill[]) {
        const r = this.skillNames.find((name) => skills.some((v) => v.name === name && v.pp > 0));
        return skills.find((v) => v.name === r)?.id;
    }
}

export class NoBloodSwitchLink {
    petNames: string[] = [];
    constructor(names: string[]) {
        this.petNames = names;
    }
    /**
     * @returns 匹配失败返回 -1
     */
    match(pets: Pet[], dyingCt: number) {
        let checkName = '';
        for (const pet of pets) {
            if (pet.catchTime === dyingCt) {
                checkName = pet.name;
                break;
            }
        }
        if (!this.petNames.includes(checkName)) return -1;
        checkName = this.petNames[this.petNames.indexOf(checkName) + 1];
        for (let i = 0; i < pets.length; i++) {
            const pet = pets[i];
            if (pet.name === checkName) {
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

export function generateStrategy(_snm: string[], _dsl: string[]): MoveStrategy {
    const snm = new SkillNameMatch(_snm);
    const dsl = new NoBloodSwitchLink(_dsl);
    return {
        resolveNoBlood(round, skills, pets) {
            return dsl.match(pets, round.self.catchtime);
        },
        resolveMove(round, skills, _pets) {
            return Operator.useSkill(snm.match(skills));
        },
    };
}

export const autoStrategy: MoveStrategy = {
    resolveNoBlood: () => -1,
    resolveMove: async () => {
        Operator.auto();
        return Promise.resolve(true);
    },
    // if (!FighterModelFactory.playerMode) {
    //     return;
    // }
    // const {skillPanel} = FighterModelFactory.playerMode.subject.array[1];
    // skillPanel.auto();
};

export interface GeneralStrategy {
    dsl: Array<string[]>;
    snm: Array<string[]>;
    fallback: MoveStrategy;
}

export async function resolveStrategy(strategy: GeneralStrategy) {
    if (FighterModelFactory.playerMode == null) {
        throw `[error] 执行策略失败: 当前playerMode为空`;
    }

    if (Manager.hasSetStrategy()) {
        return;
    }

    await delay(300);
    let info = Provider.getCurRoundInfo()!;
    let skills = Provider.getCurSkills()!;
    const pets = Provider.getPets()!;

    let success = false;
    if (info.isSwitchNoBlood) {
        for (const petNames of strategy.dsl) {
            const matcher = new NoBloodSwitchLink(petNames);
            const index = matcher.match(pets, info.self.catchtime);
            success = await Operator.switchPet(index);
            if (success) {
                break;
            }
        }

        if (!success) {
            const index = strategy.fallback.resolveNoBlood(info, skills, pets);
            if (index) {
                (await Operator.switchPet(index)) || Operator.auto();
            }
        }

        await delay(300);
        skills = Provider.getCurSkills()!;
        info = Provider.getCurRoundInfo()!;
    }

    success = false;

    for (const skillNames of strategy.snm) {
        const matcher = new SkillNameMatch(skillNames);
        const skillId = matcher.match(skills);
        success = await Operator.useSkill(skillId);
        if (success) {
            break;
        }
    }

    if (!success) {
        strategy.fallback.resolveMove(info, skills, pets);
    }
}
