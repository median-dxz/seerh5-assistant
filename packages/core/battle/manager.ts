import { delay } from '../common/utils.js';
import { provider } from './provider.js';
import type { MoveStrategy } from './strategy.js';

export type Trigger = () => void;

export interface FightDelaySetting {
    /** @default 4500 */
    fightInterval: number;
    /** @default 2000 */
    fightEndTimeout: number;
    /** @default 350 */
    moveInterval: number;
}

const context: {
    strategy: undefined | MoveStrategy;
    triggerLock: null | ((value: boolean | PromiseLike<boolean>) => void);
    delayTimeout: null | Promise<void>;
    // for strategy
    rotatingCount: Map<string, number>;
} & FightDelaySetting = {
    strategy: undefined,
    triggerLock: null,
    delayTimeout: null,
    rotatingCount: new Map(),
    fightInterval: 4000,
    fightEndTimeout: 2000,
    moveInterval: 350
};

function takeover(trigger: Trigger, _strategy?: MoveStrategy): Promise<boolean> {
    if (context.triggerLock == undefined) {
        try {
            trigger();
        } catch (err) {
            return Promise.reject(err);
        }

        const { resolve, promise } = Promise.withResolvers<boolean>();
        context.strategy = _strategy;
        context.triggerLock = resolve;

        return promise;
    } else {
        return Promise.reject('已经接管了一场战斗！');
    }
}

async function resolveStrategy(strategy?: MoveStrategy) {
    strategy = context.strategy ?? strategy;
    if (!strategy || !provider.isInBattle()) return;

    if (FighterModelFactory.playerMode == null) {
        throw new Error(`resolve strategy failed: 当前playerMode为空`);
    }

    await delay(context.moveInterval);

    let battleContext = [provider.getCurRoundInfo()!, provider.getCurSkills()!, provider.getPets()!] as const;

    if (battleContext[0].isSwitchNoBlood) {
        const r = await strategy.resolveNoBlood(...battleContext);
        if (!r) throw new Error(`resolve strategy failed: 死切失败`);

        await delay(context.moveInterval);

        battleContext = [provider.getCurRoundInfo()!, provider.getCurSkills()!, battleContext[2]];
        battleContext[0].isSwitchNoBlood = true;
    }

    // 战斗已经结束, 例如在死切中escape
    if (!provider.isInBattle()) {
        return;
    }

    const r = await strategy.resolveMove(...battleContext);
    if (!r) throw new Error(`resolve strategy failed: 执行策略失败`);
}

function clear() {
    context.delayTimeout = null;
    context.triggerLock = null;
    context.strategy = undefined;
    context.rotatingCount = new Map<string, number>();
}

function setFightDelay({
    fightEndTimeout = context.fightEndTimeout,
    fightInterval = context.fightInterval,
    moveInterval = context.moveInterval
}: Partial<FightDelaySetting>) {
    context.fightInterval = fightInterval;
    context.fightEndTimeout = fightEndTimeout;
    context.moveInterval = moveInterval;
}

const manager = {
    takeover,
    resolveStrategy,
    clear,
    setFightDelay
};

export { context, manager };
