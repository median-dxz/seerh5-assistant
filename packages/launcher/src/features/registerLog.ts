import * as Logger from '@/utils/logger';
import { Hook, SEAEventSource, Subscription, wrapper } from 'sea-core';

export function registerLog() {
    SystemTimerManager.sockettimeout = wrapper(SystemTimerManager.sockettimeout).after(() => {
        console.trace('客户端主动关闭');
    });

    const sub = new Subscription();
    const battleStart$ = SEAEventSource.hook(Hook.Battle.battleStart);
    const battleEnd$ = SEAEventSource.hook(Hook.Battle.battleEnd);

    sub.on(battleStart$, () => {
        Logger.BattleLogger.info(`检测到对战开始`);
    });

    sub.on(battleEnd$, () => {
        const win = Boolean(FightManager.isWin);
        Logger.BattleLogger.info(`检测到对战结束 对战胜利: ${win}`);
    });

    sub.on(SEAEventSource.hook(Hook.Award.receive), (data) => {
        Logger.AwardLogger.info(`获得物品:`);
        const logStr = Array.isArray(data.items)
            ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
            : undefined;
        logStr && Logger.AwardLogger.info(logStr.join('\r\n'));
    });

    sub.on(SEAEventSource.hook(Hook.Module.loadScript), (name) => {
        Logger.ModuleLogger.info(`检测到新模块加载: ${name}`);
    });

    sub.on(SEAEventSource.hook(Hook.Module.openMainPanel), ({ module, panel }) => {
        Logger.ModuleLogger.info(`${module}创建主面板: ${panel}`);
    });

    // sub.on(fromSocket(CommandID.NOTE_USE_SKILL, 'receive'), (data) => {
    //     const [fi, si] = data;
    //     Logger.BattleManager.info(`对局信息更新:
    //         先手方:${fi.userId}
    //         hp: ${fi.hp.remain} / ${fi.hp.max}
    //         造成伤害: ${fi.damage}
    //         是否暴击:${fi.isCrit}
    //         使用技能: ${SkillXMLInfo.getName(fi.skillId)}
    //         ===========
    //         后手方:${si.userId}
    //         hp: ${si.hp.remain} / ${si.hp.max}
    //         造成伤害: ${si.damage}
    //         是否暴击:${si.isCrit}
    //         使用技能: ${SkillXMLInfo.getName(si.skillId)}`);
    // });
}
