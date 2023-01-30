import { EVENTS } from '../const';

import Skill from '../entities/skill';

import { BattleInfoProvider, PetSwitchInfo, RoundInfo } from './infoprovider';
import { BattleOperator } from './operator';

import { delay } from '../common';

import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('BattleModuleManager', defaultStyle.core);

const { SAEventTarget } = window;

const handleBattleModule = () => {
    if (FighterModelFactory.playerMode == null || BattleModuleManager.running === false) return;
    BattleModuleManager.strategy.resolve();
};

const handleBattleEnd = (e: Event) => {
    if (e instanceof CustomEvent) {
        const { isWin } = e.detail as { isWin: boolean };
        if (BattleModuleManager.lockingTrigger) {
            BattleModuleManager.running = false;
            const { lockingTrigger } = BattleModuleManager;
            if (BattleModuleManager.delayTimeout) {
                BattleModuleManager.delayTimeout.then(() => {
                    lockingTrigger(isWin);
                });
            }
            BattleModuleManager.lockingTrigger = undefined;
        }
    }
};

namespace AutoBattle {
    export type Trigger = () => void;

    export type MoveModule = (battleStatus: RoundInfo, skills: Skill[], pets: PetSwitchInfo[]) => PromiseLike<void>;

    export interface Strategy {
        _dsl: Array<string[]>;
        _snm: Array<string[]>;
        get dsl(): Array<string[]>;
        set dsl(n: Array<string[]>);
        get snm(): Array<string[]>;
        set snm(n: Array<string[]>);
        custom?: MoveModule;
        default: {
            switchNoBlood: MoveModule;
            useSkill: MoveModule;
        };
        resolve(): void;
    }
}

const BattleModuleManager: {
    _running: boolean;
    get running(): boolean;
    set running(state: boolean);
    strategy: AutoBattle.Strategy;
    lockingTrigger?: (value: boolean | PromiseLike<boolean>) => void;
    delayTimeout?: Promise<void>;
    runOnce(trigger: AutoBattle.Trigger): Promise<boolean>;
    clear(): void;
} = {
    _running: false,

    get running() {
        return this._running;
    },

    set running(state: boolean) {
        this._running = state;
        SAEventTarget.dispatchEvent(new CustomEvent('sa_battle_manager_state_changed'));
    },

    strategy: {
        _dsl: [],
        _snm: [],
        get dsl() {
            if (this._dsl.length === 0 && window) {
                let item = window.localStorage.getItem('BattleStrategyDSL');
                if (item) {
                    this._dsl = JSON.parse(item);
                }
            }
            return this._dsl;
        },
        get snm() {
            if (this._dsl.length === 0 && window) {
                let item = window.localStorage.getItem('BattleStrategySNM');
                if (item) {
                    this._snm = JSON.parse(item);
                }
            }
            return this._snm;
        },
        set dsl(n) {
            this._dsl = n;
            window.localStorage.setItem('BattleStrategyDSL', JSON.stringify(this._dsl));
            SAEventTarget.dispatchEvent(new CustomEvent('sa_battle_manager_state_changed'));
        },
        set snm(n) {
            this._snm = n;
            window.localStorage.setItem('BattleStrategySNM', JSON.stringify(this._snm));
            SAEventTarget.dispatchEvent(new CustomEvent('sa_battle_manager_state_changed'));
        },
        custom: undefined,

        default: {
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
        },

        async resolve() {
            const info = BattleInfoProvider.getCurRoundInfo()!;
            let skills = BattleInfoProvider.getCurSkills()!;
            const pets = BattleInfoProvider.getPets()!;

            if (this.custom != undefined) {
                this.custom(info, skills, pets);
                log('执行自定义行动策略');
                return;
            }

            let success = false;

            if (info.isDiedSwitch) {
                for (let petNames of this.dsl) {
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
                    this.default.switchNoBlood(info, skills, pets);
                    log('执行默认死切策略');
                }

                await delay(600);
                skills = BattleInfoProvider.getCurSkills()!;
            }

            success = false;

            for (let skillNames of this.snm) {
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
                this.default.useSkill(info, skills, pets);
                log('执行默认技能使用策略');
            }
        },
    },

    lockingTrigger: undefined,
    runOnce(trigger: AutoBattle.Trigger) {
        if (this.lockingTrigger == undefined) {
            this.running = true;
            try {
                trigger();
            } catch (err) {
                return Promise.reject(err);
            }
            return new Promise((resolve) => {
                this.lockingTrigger = resolve;
                this.delayTimeout = delay(6000);
            });
        } else {
            return Promise.reject('已经有一场正在等待回调的战斗！');
        }
    },
    clear() {
        this.lockingTrigger = undefined;
        this.delayTimeout = undefined;
        this.strategy.custom = undefined;
        this.running = false;
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

SAEventTarget.addEventListener(EVENTS.BattlePanel.panelReady, handleBattleModule);
SAEventTarget.addEventListener(EVENTS.BattlePanel.roundEnd, handleBattleModule);
SAEventTarget.addEventListener(EVENTS.BattlePanel.battleEnd, handleBattleEnd);

import * as BaseStrategy from './strategy';

export { BaseStrategy as BaseStrategy, AutoBattle };
export { BattleInfoProvider as InfoProvider, BattleOperator as Operator, BattleModuleManager as Manager };
export { generateStrategy };

