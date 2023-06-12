import React, { useEffect, useState } from 'react';

import { CssBaseline } from '@mui/material';
import { Container, GlobalStyles, ThemeProvider, alpha } from '@mui/system';

import { PanelStateContext } from '@sa-app/context/PanelState';
import { SAContext } from '@sa-app/context/SAContext';

import * as SALocalStorage from '@sa-app/utils/hooks/SALocalStorage';

import { saTheme } from '@sa-app/style';

import ElectricBolt from '@mui/icons-material/ElectricBolt';

import { HexagonalButton } from '@sa-app/components/styled/HexagonalButton';
import { CommandBar } from './views/CommandBar';
import { MainPanel } from './views/MainPanel';

import * as core from 'sa-core';

import { Hook, resolveStrategy } from 'sa-core';
import { SAEventBus } from 'sa-core/event-bus';
import { QuickAccess } from './views/QuickAccess';

const sac = window.sac;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).sac = { ...core, ...sac };

const battleStrategyStorage = SALocalStorage.BattleStrategy;
const eventBus = new SAEventBus();

export default function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);
    const [lockMainPanel, toggleMainPanelLock] = useState(false);
    const [isFighting, toggleFighting] = useState(false);

    const [battleAuto, setBattleAuto] = useState(false);

    const handleShortCut = (e: KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
    };

    useEffect(() => {
        const handleBattleRoundEnd = () => {
            toggleFighting(true);
            if (battleAuto) {
                resolveStrategy({
                    dsl: battleStrategyStorage.dsl,
                    snm: battleStrategyStorage.snm,
                    // fallback: autoStrategy,
                    fallback: {
                        resolveMove: async () => true,
                        resolveNoBlood: core.NULL,
                    },
                });
            }
        };

        document.body.addEventListener('keydown', handleShortCut);

        eventBus.hook(Hook.BattlePanel.panelReady, handleBattleRoundEnd);
        eventBus.hook(Hook.BattlePanel.roundEnd, handleBattleRoundEnd);
        eventBus.hook(Hook.BattlePanel.battleEnd, () => {
            toggleFighting(false);
        });

        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            eventBus.unmount();
        };
    }, [lockMainPanel, battleAuto]);

    return (
        <ThemeProvider theme={saTheme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    '::-webkit-scrollbar': {
                        width: 8,
                        height: 8,
                    },
                    '::-webkit-scrollbar-track': {
                        backgroundColor: alpha(saTheme.palette.background.default, 0.24),
                    },
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: saTheme.palette.background.default,
                    },
                }}
            />
            <Container id="sa-main">
                <SAContext.Provider
                    value={{
                        Battle: {
                            enableAuto: battleAuto,
                            updateAuto: setBattleAuto,
                        },
                    }}
                >
                    <PanelStateContext.Provider
                        value={{
                            open: isMainPanelOpen,
                            setOpen: toggleMainPanel,
                            lock: lockMainPanel,
                            setLock: toggleMainPanelLock,
                        }}
                    >
                        {!isFighting && <QuickAccess />}
                        <CommandBar show={isCommandBarOpen} />
                        <HexagonalButton
                            baseSize={32}
                            sx={{ top: '10vh', left: '6vw', position: 'absolute', zIndex: 3 }}
                            onClick={() => {
                                toggleMainPanel((preState) => !preState);
                            }}
                        >
                            <ElectricBolt />
                        </HexagonalButton>
                        <MainPanel show={isMainPanelOpen} lock={lockMainPanel} setLock={toggleMainPanelLock} />
                    </PanelStateContext.Provider>
                </SAContext.Provider>
            </Container>
        </ThemeProvider>
    );
}
