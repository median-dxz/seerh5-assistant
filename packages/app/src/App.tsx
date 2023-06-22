import React, { useEffect, useState } from 'react';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';

import { SAContext } from '@sa-app/context/SAContext';

import * as SALocalStorage from '@sa-app/utils/hooks/SALocalStorage';

import { saTheme } from '@sa-app/style';

import { CommandBar } from './CommandBar';
import { MainPanel } from './views/MainPanel';

import { Hook, NULL, resolveStrategy } from 'sa-core';
import { SAEventBus } from 'sa-core/event-bus';

import { SAModManager } from './ModManager';
import { QuickAccess } from './QuickAccess';

const battleStrategyStorage = SALocalStorage.BattleStrategy;
const eventBus = new SAEventBus();

export default function SaApp() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isFighting, toggleFighting] = useState(false);
    const [battleAuto, setBattleAuto] = useState(false);

    const handleShortCut = (e: KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
    };

    const handleBattleRoundEnd = React.useCallback(() => {
        if (battleAuto) {
            resolveStrategy({
                dsl: battleStrategyStorage.dsl,
                snm: battleStrategyStorage.snm,
                // fallback: autoStrategy,
                fallback: {
                    resolveMove: async () => true,
                    resolveNoBlood: NULL,
                },
            });
        }
    }, [battleAuto]);

    useEffect(() => {
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        canvas.setAttribute('tabindex', '-1');

        document.body.addEventListener('keydown', handleShortCut);

        eventBus.hook(Hook.BattlePanel.panelReady, () => {
            toggleFighting(true);
        });
        eventBus.hook(Hook.BattlePanel.panelReady, handleBattleRoundEnd);
        eventBus.hook(Hook.BattlePanel.roundEnd, handleBattleRoundEnd);
        eventBus.hook(Hook.BattlePanel.battleEnd, () => {
            toggleFighting(false);
        });

        let active = true;
        SAModManager.fetchMods().then((mods) => {
            if (active) {
                SAModManager.setup(mods);
            }
        });

        const clean = () => {
            active = false;
            SAModManager.teardown();
            eventBus.unmount();
            document.body.removeEventListener('keydown', handleShortCut);
        };

        window.addEventListener('unload', clean);

        return clean;
    }, [handleBattleRoundEnd]);

    return (
        <ThemeProvider theme={saTheme}>
            <SAContext.Provider
                value={{
                    Battle: {
                        enableAuto: battleAuto,
                        updateAuto: setBattleAuto,
                    },
                }}
            >
                <CssBaseline />

                {!isFighting && <QuickAccess />}
                <CommandBar open={isCommandBarOpen} />
                <MainPanel />
            </SAContext.Provider>
        </ThemeProvider>
    );
}
