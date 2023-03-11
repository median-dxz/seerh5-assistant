import { Pet, Skill } from '../entity';
import { RoundInfo } from './provider';

export type Trigger = () => void;
export type MoveModule = (battleState: RoundInfo, skills: Skill[], pets: Pet[]) => PromiseLike<void>;

export const Manager: {
    triggerLocker?: (value: boolean | PromiseLike<boolean>) => void;
    delayTimeout?: Promise<void>;
    strategy?: MoveModule;
    runOnce(trigger: Trigger): Promise<boolean>;
    clear(): void;
} = {
    triggerLocker: undefined,
    strategy: undefined,
    runOnce(trigger: Trigger) {
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
