import { delay } from '../common';
import { Pet, Skill } from '../entity';
import { SaModuleLogger, defaultStyle } from '../logger';
import type { MoveModule } from './manager';
import { Manager } from './manager';
import { Operator } from './operator';
import { Provider } from './provider';

const log = SaModuleLogger('BattleModuleManager', defaultStyle.core);

export class SkillNameMatch {
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

export class DiedSwitchLink {
    petNames: string[] = [];
    constructor(names: string[]) {
        this.petNames = names;
    }
    /**
     * @returns 匹配失败返回 -1
     */
    match(pets: Pet[], dyingCt: number) {
        let checkName = '';
        for (let pet of pets) {
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

export function generateStrategy(_snm: string[], _dsl: string[]): MoveModule {
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

export const defaultStrategy = {
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

export interface Strategy {
    dsl: Array<string[]>;
    snm: Array<string[]>;
    default: {
        switchNoBlood: MoveModule;
        useSkill: MoveModule;
    };
}

export async function resolveStrategy(strategy: Strategy) {
    if (FighterModelFactory.playerMode == null) {
        log(`执行策略失败: 当前playerMode为空`);
        return;
    }

    if (Manager.hasSetStrategy()) {
        return;
    }

    const info = Provider.getCurRoundInfo()!;
    let skills = Provider.getCurSkills()!;
    const pets = Provider.getPets()!;

    let success = false;

    if (info.isDiedSwitch) {
        for (let petNames of strategy.dsl) {
            const matcher = new DiedSwitchLink(petNames);
            const r = matcher.match(pets, info.self!.catchtime);
            if (r !== -1) {
                Operator.switchPet(r);
                success = true;
                log(`精灵索引 ${r} 匹配成功: 死切链: [${petNames.join('|')}]`);
                break;
            }
        }

        if (!success) {
            strategy.default.switchNoBlood(info, skills, pets);
            log('执行默认死切策略');
        }

        await delay(600);
        skills = Provider.getCurSkills()!;
    }

    success = false;

    for (let skillNames of strategy.snm) {
        const matcher = new SkillNameMatch(skillNames);
        const r = matcher.match(skills);
        if (r) {
            Operator.useSkill(r);
            success = true;
            log(`技能 ${r} 匹配成功: 技能组: [${skillNames.join('|')}]`);
            break;
        }
    }

    if (!success) {
        strategy.default.useSkill(info, skills, pets);
        log('执行默认技能使用策略');
    }
}
