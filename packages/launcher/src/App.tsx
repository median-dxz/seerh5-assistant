import React, { useEffect, useState } from 'react';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';

import { SEAContext } from '@sea-launcher/context/SAContext';

import { SEAModuleLogger } from '@sea-launcher/utils/logger';

import { saTheme } from '@sea-launcher/style';

import { CommandBar } from './CommandBar';
import { MainPanel } from './views/MainPanel';

import { Hook, SEAHookEmitter } from 'sea-core';
import { Manager as BattleManager, autoStrategy } from 'sea-core/battle';
import { EventBus, SocketEventEmitter } from 'sea-core/emitter';

import { QuickAccess } from './QuickAccess';
import { SEAModManager } from './service/ModManager';

const eventBus = new EventBus();

// console.log(import.meta.env.DEV);

const Logger = {
    BattleManager: { info: SEAModuleLogger('BattleManager', 'info') },
    AwardManager: { info: SEAModuleLogger('AwardManager', 'info') },
    ModuleManger: { info: SEAModuleLogger('ModuleManger', 'info') },
};

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

        const hookEmitter = eventBus.delegate(SEAHookEmitter);
        const socketEmitter = eventBus.delegate(SocketEventEmitter);

        hookEmitter.on(Hook.Battle.battleStart, () => {
            toggleFighting(true);
        });

        hookEmitter.on(Hook.Battle.battleStart, handleBattleRoundEnd);
        hookEmitter.on(Hook.Battle.roundEnd, handleBattleRoundEnd);
        hookEmitter.on(Hook.Battle.battleEnd, () => {
            toggleFighting(false);
        });

        hookEmitter.on(Hook.Battle.battleStart, () => {
            Logger.BattleManager.info(`检测到对战开始`);
        });

        hookEmitter.on(Hook.Battle.battleEnd, () => {
            const win = Boolean(FightManager.isWin);
            Logger.BattleManager.info(`检测到对战结束 对战胜利: ${win}`);
        });

        hookEmitter.on(Hook.Award.receive, (data) => {
            Logger.AwardManager.info(`获得物品:`);
            const logStr = Array.isArray(data.items)
                ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
                : undefined;
            logStr && Logger.AwardManager.info(logStr.join('\r\n'));
        });

        hookEmitter.on(Hook.Module.loadScript, (name) => {
            Logger.ModuleManger.info(`检测到新模块加载: ${name}`);
        });

        hookEmitter.on(Hook.Module.openMainPanel, ({ module, panel }) => {
            Logger.ModuleManger.info(`${module}创建主面板: ${panel}`);
        });

        socketEmitter.on(CommandID.NOTE_USE_SKILL, 'receive', (data) => {
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

        socketEmitter.on(CommandID.USE_SKILL, 'send', (data) => {
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
            eventBus.dispose();
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
