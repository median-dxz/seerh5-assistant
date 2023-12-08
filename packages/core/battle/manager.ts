import { delay } from '../common/utils.js';
import { Provider } from './provider.js';
import type { MoveStrategy } from './strategy.js';

export type Trigger = () => void;

const context: {
    strategy: undefined | MoveStrategy;
    triggerLock: null | ((value: boolean | PromiseLike<boolean>) => void);
    delayTimeout: null | Promise<void>;
} = {
    strategy: undefined,
    triggerLock: null,
    delayTimeout: null,
};

function takeover(trigger: Trigger, _strategy?: MoveStrategy): Promise<boolean> {
    if (context.triggerLock == undefined) {
        try {
            trigger();
        } catch (err) {
            return Promise.reject(err);
        }
        return new Promise((resolve) => {
            context.strategy = _strategy;
            context.triggerLock = resolve;
        });
    } else {
        return Promise.reject('已经接管了一场战斗！');
    }
}

async function resolveStrategy(strategy?: MoveStrategy) {
    strategy = context.strategy ?? strategy;
    if (!strategy || !Provider.isInBattle()) return;

    if (FighterModelFactory.playerMode == null) {
        throw `[error] 当前playerMode为空`;
    }
    
    await delay(200);

    let battleContext = [Provider.getCurRoundInfo()!, Provider.getCurSkills()!, Provider.getPets()!] as const;

    if (battleContext[0].isSwitchNoBlood) {
        const r = await strategy.resolveNoBlood(...battleContext);
        if (!r) throw `[error] 死切失败`;

        await delay(200);

        battleContext = [Provider.getCurRoundInfo()!, Provider.getCurSkills()!, battleContext[2]];
    }

    // 战斗已经结束, 例如在死切中escape
    if (!Provider.isInBattle()) {
        return;
    }

    const r = await strategy.resolveMove(...battleContext);
    if (!r) throw `[error] 执行策略失败`;
}

function clear() {
    context.strategy = undefined;
    context.triggerLock = null;
}

export { clear, context, resolveStrategy, takeover };
