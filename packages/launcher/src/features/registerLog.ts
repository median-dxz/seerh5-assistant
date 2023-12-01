import * as Logger from '@sea/launcher/utils/logger';
import { DataSource, Hook, Subscription, wrapper } from 'sea-core';

export function registerLog() {
    SystemTimerManager.sockettimeout = wrapper(SystemTimerManager.sockettimeout).after(() => {
        console.trace('客户端主动关闭');
    });

    const sub = new Subscription();
    const battleStart$ = DataSource.hook(Hook.Battle.battleStart);
    const battleEnd$ = DataSource.hook(Hook.Battle.battleEnd);

    sub.on(battleStart$, () => {
        Logger.BattleManager.info(`检测到对战开始`);
    });

    sub.on(battleEnd$, () => {
        const win = Boolean(FightManager.isWin);
        Logger.BattleManager.info(`检测到对战结束 对战胜利: ${win}`);
    });

    sub.on(DataSource.hook(Hook.Award.receive), (data) => {
        Logger.AwardManager.info(`获得物品:`);
        const logStr = Array.isArray(data.items)
            ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
            : undefined;
        logStr && Logger.AwardManager.info(logStr.join('\r\n'));
    });

    sub.on(DataSource.hook(Hook.Module.loadScript), (name) => {
        Logger.ModuleManger.info(`检测到新模块加载: ${name}`);
    });

    sub.on(DataSource.hook(Hook.Module.openMainPanel), ({ module, panel }) => {
        Logger.ModuleManger.info(`${module}创建主面板: ${panel}`);
    });
}
