import * as Logger from '@/shared/logger';
import { SEAEventSource, Subscription } from '@sea/core';

export function extraLog() {
    const sub = new Subscription();
    const battleStart$ = SEAEventSource.hook('battle:start');
    const battleEnd$ = SEAEventSource.hook('battle:end');

    sub.on(battleStart$, () => {
        Logger.BattleLogger.info(`检测到对战开始`);
    });

    sub.on(battleEnd$, () => {
        const win = Boolean(FightManager.isWin);
        Logger.BattleLogger.info(`检测到对战结束 对战胜利: ${win}`);
    });

    sub.on(SEAEventSource.hook('award:receive'), (data) => {
        Logger.AwardLogger.info(`获得物品:`);
        const logStr = Array.isArray(data.items)
            ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
            : undefined;
        logStr && Logger.AwardLogger.info(logStr.join('\r\n'));
    });

    sub.on(SEAEventSource.hook('module:loadScript'), (name) => {
        Logger.ModuleLogger.info(`检测到新模块加载: ${name}`);
    });

    sub.on(SEAEventSource.hook('module:openMainPanel'), ({ module, panel }) => {
        Logger.ModuleLogger.info(`${module}创建主面板: ${panel}`);
    });
}

// TODO 战斗日志保存
// sub.on(fromsocket(CommandID.NOTE_USE_SKILL, 'receive'), (data) => {
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
