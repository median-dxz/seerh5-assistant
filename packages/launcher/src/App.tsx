import React, { useEffect, useState } from 'react';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';

import { SEAContext } from '@sea-launcher/context/SAContext';

import { SeaModuleLogger } from '@sea-launcher/utils/logger';

import { saTheme } from '@sea-launcher/style';

import { CommandBar } from './CommandBar';
import { MainPanel } from './views/MainPanel';

import { Hook } from 'sea-core';
import { Manager as BattleManager, autoStrategy } from 'sea-core/battle';
import { EventBus, SocketListener, type SocketEventHandler } from 'sea-core/event-bus';

import { QuickAccess } from './QuickAccess';
import { SEAModManager } from './service/ModManager';

const eventBus = new EventBus();

// console.log(import.meta.env.DEV);

const Logger = {
    BattleManager: { info: SeaModuleLogger('BattleManager', 'info') },
    AwardManager: { info: SeaModuleLogger('AwardManager', 'info') },
    ModuleManger: { info: SeaModuleLogger('ModuleManger', 'info') },
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

        eventBus.hook(Hook.Battle.battleStart, () => {
            toggleFighting(true);
        });
        eventBus.hook(Hook.Battle.battleStart, handleBattleRoundEnd);
        eventBus.hook(Hook.Battle.roundEnd, handleBattleRoundEnd);
        eventBus.hook(Hook.Battle.battleEnd, () => {
            toggleFighting(false);
        });

        eventBus.hook(Hook.Battle.battleStart, () => {
            Logger.BattleManager.info(`检测到对战开始`);
        });

        eventBus.hook(Hook.Battle.battleEnd, () => {
            const win = Boolean(FightManager.isWin);
            Logger.BattleManager.info(`检测到对战结束 对战胜利: ${win}`);
        });

        eventBus.hook(Hook.Award.receive, (data) => {
            Logger.AwardManager.info(`获得物品:`);
            const logStr = Array.isArray(data.items)
                ? data.items.map((v) => `${ItemXMLInfo.getName(v.id)} ${v.count}`)
                : undefined;
            logStr && Logger.AwardManager.info(logStr.join('\r\n'));
        });

        eventBus.hook(Hook.Module.loadScript, (name) => {
            Logger.ModuleManger.info(`检测到新模块加载: ${name}`);
        });

        eventBus.hook(Hook.Module.openMainPanel, ({ module, panel }) => {
            Logger.ModuleManger.info(`${module}创建主面板: ${panel}`);
        });

        const noteUseSkillHandler: SocketEventHandler<typeof CommandID.NOTE_USE_SKILL> = {
            cmd: CommandID.NOTE_USE_SKILL,
            res(data) {
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
            },
        };

        const useSkillHandler: SocketEventHandler<typeof CommandID.USE_SKILL> = {
            cmd: CommandID.USE_SKILL,
            req(data) {
                const [skillId] = data as [number];
                Logger.BattleManager.info(
                    `${FighterModelFactory.playerMode?.info.petName} 使用技能: ${SkillXMLInfo.getName(skillId)}`
                );
            },
        };

        SocketListener.on(noteUseSkillHandler);
        SocketListener.on(useSkillHandler);

        let active = true;
        SEAModManager.fetchMods().then((mods) => {
            if (active) {
                SEAModManager.setup(mods);
                setSetup(true);
            }
        });

        const clean = () => {
            active = false;
            SocketListener.off(noteUseSkillHandler);
            SocketListener.off(useSkillHandler);
            SEAModManager.teardown();
            eventBus.unmount();
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
