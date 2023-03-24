import { Pet, Skill } from '../entity';
import { RoundInfo } from './provider';

export type Trigger = () => void;
export type MoveModule = (battleState: RoundInfo, skills: Skill[], pets: Pet[]) => PromiseLike<void>;

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
    resolveStrategy(info: RoundInfo, skills: Skill[], pets: Pet[]) {
        strategy && strategy(info, skills, pets);
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
