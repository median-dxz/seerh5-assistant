import * as Logger from '@/utils/logger';
import { EventSource, Hook, Subscription, wrapper } from 'sea-core';

export function registerLog() {
    SystemTimerManager.sockettimeout = wrapper(SystemTimerManager.sockettimeout).after(() => {
        console.trace('客户端主动关闭');
    });

    const sub = new Subscription();
    const battleStart$ = EventSource.hook(Hook.Battle.battleStart);
    const battleEnd$ = EventSource.hook(Hook.Battle.battleEnd);

    sub.on(battleStart$, () => {
        Logger.BattleLogger.info(`检测到对战开始`);
    });

    sub.on(battleEnd$, () => {
        const win = Boolean(FightManager.isWin);
        Logger.BattleLogger.info(`检测到对战结束 对战胜利: ${win}`);
    });

    sub.on(EventSource.hook(Hook.Award.receive), (data) => {
        Logger.AwardLogger.info(`获得物品:`);
        const logStr = Array.isArray(data.items)
            ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
            : undefined;
        logStr && Logger.AwardLogger.info(logStr.join('\r\n'));
    });

    sub.on(EventSource.hook(Hook.Module.loadScript), (name) => {
        Logger.ModuleLogger.info(`检测到新模块加载: ${name}`);
    });

    sub.on(EventSource.hook(Hook.Module.openMainPanel), ({ module, panel }) => {
        Logger.ModuleLogger.info(`${module}创建主面板: ${panel}`);
    });
}
