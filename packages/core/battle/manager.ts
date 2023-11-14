import { delay } from '../common/utils.js';
import type { Pet, Skill } from '../entity/index.js';
import { Operator } from './operator.js';
import type { RoundInfo } from './provider.js';
import { Provider } from './provider.js';

export type Trigger = () => void;
export type MoveHandler = (battleState: RoundInfo, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type SwitchNoBloodHandler = (battleState: RoundInfo, skills: Skill[], pets: Pet[]) => number | void;
export type MoveStrategy = {
    resolveNoBlood: SwitchNoBloodHandler;
    resolveMove: MoveHandler;
};

let strategy: undefined | MoveStrategy;
let triggerLocker: undefined | ((value: boolean | PromiseLike<boolean>) => void);

export const Manager = {
    delayTimeout: undefined as undefined | Promise<void>,
    run(trigger: Trigger, _strategy: MoveStrategy): Promise<boolean> {
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

// todo
// 单独导出resolveStrategy
// 处理resolve逻辑
// Strategy专注于提供基础模型
// Manager职责类似Level
// 接管的战斗 -> 设置的strategy
// 没接管的 / 没设置st -> 检查是否传入st
// 没传入 -> 默认(什么也不做)
// 至于传入st是auto还是其他什么->app层决定
// 同时接管的战斗具体使用什么->是调用者的职责