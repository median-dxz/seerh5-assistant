import { SaModuleLogger, defaultStyle, delay } from '../common/utils.js';
import { Pet, Skill } from '../entity/index.js';
import type { MoveModule } from './manager.js';
import { Manager } from './manager.js';
import { Operator } from './operator.js';
import { Provider } from './provider.js';

const log = SaModuleLogger('BattleModuleManager', defaultStyle.core);

export class SkillNameMatch {
    skillNames: string[] = [];
    constructor(names: string[]) {
        this.skillNames = names;
    }
    match(skills: Skill[]) {
        let r = this.skillNames.find((name) => skills.some((v) => v.name === name && v.pp > 0));
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
    const snm = new SkillNameMatch(_snm);
    const dsl = new NoBloodSwitchLink(_dsl);
    return {
        resolveNoBlood(round, skills, pets) {
            return dsl.match(pets, round.self!.catchtime);
        },
        resolveMove(round, skills, pets) {
            return Operator.useSkill(snm.match(skills));
        },
    };
}

export const defaultStrategy: MoveModule = {
    resolveNoBlood: () => -1,
    resolveMove: async () => {
        Operator.auto();
        return true;
    },
    // if (!FighterModelFactory.playerMode) {
    //     return;
    // }
    // const {skillPanel} = FighterModelFactory.playerMode.subject.array[1];
    // skillPanel.auto();
};

export interface Strategy {
    dsl: Array<string[]>;
    snm: Array<string[]>;
    default: MoveModule;
}

export async function resolveStrategy(strategy: Strategy) {
    if (FighterModelFactory.playerMode == null) {
        log(`执行策略失败: 当前playerMode为空`);
        return;
    }

    if (Manager.hasSetStrategy()) {
        return;
    }

    await delay(300);
    let info = Provider.getCurRoundInfo()!;
    let skills = Provider.getCurSkills()!;
    const pets = Provider.getPets()!;

    let success = false;
    let index: number;

    if (info.isSwitchNoBlood) {
        for (let petNames of strategy.dsl) {
            const matcher = new NoBloodSwitchLink(petNames);
            index = matcher.match(pets, info.self!.catchtime);
            success = await Operator.switchPet(index);
            if (success) {
                log(`精灵索引 ${index} 匹配成功: 死切链: [${petNames.join('|')}]`);
                break;
            }
        }

        if (!success) {
            index = strategy.default.resolveNoBlood(info, skills, pets) ?? -1;
            const r = await Operator.switchPet(index);
            r || Operator.auto();
            log('执行默认死切策略');
        }

        await delay(300);
        skills = Provider.getCurSkills()!;
        info = Provider.getCurRoundInfo()!;
    }

    success = false;

    for (let skillNames of strategy.snm) {
        const matcher = new SkillNameMatch(skillNames);
        const skillId = matcher.match(skills);
        success = await Operator.useSkill(skillId);
        if (success) {
            log(`技能 ${skillId} 匹配成功: 技能组: [${skillNames.join('|')}]`);
            break;
        }
    }

    if (!success) {
        strategy.default.resolveMove(info, skills, pets);
        log('执行默认技能使用策略');
    }
}
