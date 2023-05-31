import { delay } from '../common/index.js';
import { Pet, Skill } from '../entity/index.js';
import { Operator } from './operator.js';
import { Provider, RoundInfo } from './provider.js';

export type Trigger = () => void;
export type MoveHandler = (battleState: RoundInfo, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type SwitchNoBloodHandler = (battleState: RoundInfo, skills: Skill[], pets: Pet[]) => number | void;
export type MoveModule = {
    resolveNoBlood: SwitchNoBloodHandler;
    resolveMove: MoveHandler;
};

let strategy: undefined | MoveModule;
let triggerLocker: undefined | ((value: boolean | PromiseLike<boolean>) => void);

export const Manager = {
    delayTimeout: undefined as undefined | Promise<void>,
    runOnce(trigger: Trigger, _strategy: MoveModule): Promise<boolean> {
        if (triggerLocker == undefined) {
            try {
                trigger();
            } catch (err) {
                return Promise.reject(err);
            }
            return new Promise((resolve) => {
                strategy = _strategy;
                triggerLocker = resolve;
            });
        } else {
            return Promise.reject('已经有一场正在等待回调的战斗！');
        }
    },
    hasSetStrategy() {
        return strategy != undefined && triggerLocker != undefined;
    },
    async resolveStrategy(info: RoundInfo, skills: Skill[], pets: Pet[]) {
        if (!strategy) return;
        await delay(300);
        if (info.isSwitchNoBlood) {
            const index = strategy.resolveNoBlood(info, skills, pets) ?? -1;
            const r = await Operator.switchPet(index);
            r || Operator.auto();

            await delay(300);
            skills = Provider.getCurSkills()!;
            info = Provider.getCurRoundInfo()!;
        }

        const r = await strategy.resolveMove(info, skills, pets);
        r || Operator.auto();
    },
    unlockTrigger(win: boolean) {
        triggerLocker && triggerLocker(win);
        this.delayTimeout = undefined;
    },
    clear() {
        strategy = undefined;
        triggerLocker = undefined;
    },
};
