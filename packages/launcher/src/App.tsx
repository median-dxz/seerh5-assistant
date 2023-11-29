import React, { useEffect, useState } from 'react';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';

import { SEAContext } from '@sea-launcher/context/SAContext';

import { SEAModuleLogger } from '@sea-launcher/utils/logger';

import { saTheme } from '@sea-launcher/style';

import { CommandBar } from './CommandBar';
import { MainPanel } from './views/MainPanel';

import { Hook, wrapper } from 'sea-core';
import { Manager as BattleManager, autoStrategy } from 'sea-core/battle';
import { DataSource, Subscription } from 'sea-core/data-source';

import { QuickAccess } from './QuickAccess';
import { SEAModManager } from './service/ModManager';

// console.log(import.meta.env.DEV);

const Logger = {
    BattleManager: { info: SEAModuleLogger('BattleManager', 'info') },
    AwardManager: { info: SEAModuleLogger('AwardManager', 'info') },
    ModuleManger: { info: SEAModuleLogger('ModuleManger', 'info') },
};

const CmdMask = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228, // SYSTEM_TIME_CHECK
];

SystemTimerManager.sockettimeout = wrapper(SystemTimerManager.sockettimeout).after(() => {
    console.log('客户端主动关闭');
});

export default function App() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isFighting, toggleFighting] = useState(false);
    const [battleAuto, setBattleAuto] = useState(false);
    const [isSetup, setSetup] = useState(false);

    const handleShortCut = (e: KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
    };

    const handleBattleRoundEnd = React.useCallback(() => {
        if (battleAuto) {
            Logger.BattleManager.info('执行自定义行动策略');
            BattleManager.resolveStrategy(autoStrategy);
        } else {
            BattleManager.resolveStrategy();
        }
    }, [battleAuto]);

    useEffect(() => {
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        canvas.setAttribute('tabindex', '-1');

        document.body.addEventListener('keydown', handleShortCut);

        const { hook: fromHook, socket: fromSocket } = DataSource;

        const sub = new Subscription();
        const battleStart$ = fromHook(Hook.Battle.battleStart);
        const battleEnd$ = fromHook(Hook.Battle.battleEnd);

        sub.on(battleStart$, () => {
            toggleFighting(true);
        });

        sub.on(battleStart$, handleBattleRoundEnd);
        sub.on(fromHook(Hook.Battle.roundEnd), handleBattleRoundEnd);
        sub.on(battleEnd$, () => {
            toggleFighting(false);
        });

        sub.on(battleStart$, () => {
            Logger.BattleManager.info(`检测到对战开始`);
        });

        sub.on(battleEnd$, () => {
            const win = Boolean(FightManager.isWin);
            Logger.BattleManager.info(`检测到对战结束 对战胜利: ${win}`);
        });

        sub.on(fromHook(Hook.Award.receive), (data) => {
            Logger.AwardManager.info(`获得物品:`);
            const logStr = Array.isArray(data.items)
                ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
                : undefined;
            logStr && Logger.AwardManager.info(logStr.join('\r\n'));
        });

        sub.on(fromHook(Hook.Module.loadScript), (name) => {
            Logger.ModuleManger.info(`检测到新模块加载: ${name}`);
        });

        sub.on(fromHook(Hook.Module.openMainPanel), ({ module, panel }) => {
            Logger.ModuleManger.info(`${module}创建主面板: ${panel}`);
        });

        sub.on(fromSocket(CommandID.NOTE_USE_SKILL, 'receive'), (data) => {
            const [fi, si] = data;
            Logger.BattleManager.info(`对局信息更新:
                先手方:${fi.userId}
                hp: ${fi.hp.remain} / ${fi.hp.max}
                造成伤害: ${fi.damage}
                是否暴击:${fi.isCrit}
                使用技能: ${SkillXMLInfo.getName(fi.skillId)}
                ===========
                后手方:${si.userId}
                hp: ${si.hp.remain} / ${si.hp.max}
                造成伤害: ${si.damage}
                是否暴击:${si.isCrit}
                使用技能: ${SkillXMLInfo.getName(si.skillId)}`);
        });

        sub.on(fromSocket(CommandID.NOTE_USE_SKILL, 'send'), (data) => {
            const [skillId] = data as [number];
            Logger.BattleManager.info(
                `${FighterModelFactory.playerMode?.info.petName} 使用技能: ${SkillXMLInfo.getName(skillId)}`
            );
        });

        let active = true;
        SEAModManager.fetchMods().then((mods) => {
            if (active) {
                SEAModManager.setup(mods);
                setSetup(true);
            }
        });

        const clean = () => {
            active = false;
            SEAModManager.teardown();
            sub.dispose();
            document.body.removeEventListener('keydown', handleShortCut);
        };

        window.addEventListener('unload', clean);

        return clean;
    }, [handleBattleRoundEnd]);

    return (
        <ThemeProvider theme={saTheme}>
            <SEAContext.Provider
                value={{
                    Battle: {
                        enableAuto: battleAuto,
                        updateAuto: setBattleAuto,
                    },
                }}
            >
                <CssBaseline />

                {!isFighting && isSetup && <QuickAccess />}
                <CommandBar open={isCommandBarOpen} />
                <MainPanel />
            </SEAContext.Provider>
        </ThemeProvider>
    );
}
