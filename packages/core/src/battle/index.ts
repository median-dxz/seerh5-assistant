import { delay, SAEventTarget } from '../common';
import { EVENTS } from '../const';

import Skill from '../entities/skill';
import { BattleOperator } from './operator';
import { BattleInfoProvider, PetSwitchInfo, RoundInfo } from './provider';
import * as BaseStrategy from './strategy';

import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('BattleModuleManager', defaultStyle.core);

namespace AutoBattle {
    export type Trigger = () => void;

    export type MoveModule = (battleState: RoundInfo, skills: Skill[], pets: PetSwitchInfo[]) => PromiseLike<void>;

    export interface Strategy {
        dsl: Array<string[]>;
        snm: Array<string[]>;
        default: {
            switchNoBlood: MoveModule;
            useSkill: MoveModule;
        };
    }
}

const onBattleEnd = (e: Event) => {
    if (e instanceof CustomEvent) {
        const { isWin } = e.detail as { isWin: boolean };
        if (BattleManager.triggerLocker) {
            const { triggerLocker: lockingTrigger } = BattleManager;
            if (BattleManager.delayTimeout) {
                Promise.all([BattleManager.delayTimeout, delay(1000)]).then(() => {
                    lockingTrigger(isWin);
                });
            }
            BattleManager.triggerLocker = undefined;
        }
    }
};

const BattleManager: {
    triggerLocker?: (value: boolean | PromiseLike<boolean>) => void;
    delayTimeout?: Promise<void>;
    strategy?: AutoBattle.MoveModule;
    runOnce(trigger: AutoBattle.Trigger): Promise<boolean>;
    clear(): void;
} = {
    triggerLocker: undefined,
    strategy: undefined,
    runOnce(trigger: AutoBattle.Trigger) {
        if (this.triggerLocker == undefined) {
            try {
                trigger();
            } catch (err) {
                return Promise.reject(err);
            }
            return new Promise((resolve) => {
                this.triggerLocker = resolve;
            });
        } else {
            return Promise.reject('已经有一场正在等待回调的战斗！');
        }
    },
    clear() {
        this.triggerLocker = undefined;
        this.delayTimeout = undefined;
    },
};

const onRoundStart = () => {
    const info = BattleInfoProvider.getCurRoundInfo()!;
    const skills = BattleInfoProvider.getCurSkills()!;
    const pets = BattleInfoProvider.getPets()!;

    if (BattleManager.strategy != undefined) {
        BattleManager.strategy(info, skills, pets);
        log('执行自定义行动策略');
    }

    if (info.round <= 0) {
        BattleManager.delayTimeout = delay(5000);
    }
};

SAEventTarget.addEventListener(EVENTS.BattlePanel.panelReady, onRoundStart);
SAEventTarget.addEventListener(EVENTS.BattlePanel.roundEnd, onRoundStart);
SAEventTarget.addEventListener(EVENTS.BattlePanel.battleEnd, onBattleEnd);

async function resolveStrategy(strategy: AutoBattle.Strategy) {
    if (FighterModelFactory.playerMode == null) {
        log(`执行策略失败: 当前playerMode为空`);
        return;
    }

    if (BattleManager.strategy != undefined) {
        return;
    }

    const info = BattleInfoProvider.getCurRoundInfo()!;
    let skills = BattleInfoProvider.getCurSkills()!;
    const pets = BattleInfoProvider.getPets()!;

    let success = false;

    if (info.isDiedSwitch) {
        for (let petNames of strategy.dsl) {
            const matcher = new BaseStrategy.DiedSwitchLink(petNames);
            const r = matcher.match(pets, info.self!.catchtime);
            if (r !== -1) {
                BattleOperator.switchPet(r);
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
        skills = BattleInfoProvider.getCurSkills()!;
    }

    success = false;

    for (let skillNames of strategy.snm) {
        const matcher = new BaseStrategy.SkillNameMatch(skillNames);
        const r = matcher.match(skills);
        if (r) {
            BattleOperator.useSkill(r);
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

const defaultStrategy = {
    switchNoBlood: async () => {
        BattleOperator.auto();
    },
    useSkill: async () => {
        // if (!FighterModelFactory.playerMode) {
        BattleOperator.auto();
        //     return;
        // }
        // const {skillPanel} = FighterModelFactory.playerMode.subject.array[1];
        // skillPanel.auto();
    },
};

const generateStrategy =
    (_snm: string[], _dsl: string[]): AutoBattle.MoveModule =>
    async (round, skills, pets) => {
        const snm = new BaseStrategy.SkillNameMatch(_snm);
        const dsl = new BaseStrategy.DiedSwitchLink(_dsl);
        if (round.isDiedSwitch) {
            const r = dsl.match(pets, round.self!.catchtime);
            if (r !== -1) {
                BattleOperator.switchPet(r);
            } else {
                BattleOperator.auto();
            }
            await delay(600);
            skills = BattleInfoProvider.getCurSkills()!;
        }
        const r = snm.match(skills);
        if (r) {
            BattleOperator.useSkill(r);
        } else {
            BattleOperator.auto();
        }
    };

export { BaseStrategy, AutoBattle };
export { BattleInfoProvider as InfoProvider, BattleOperator as Operator, BattleManager as Manager };
export { generateStrategy, defaultStrategy, resolveStrategy };

