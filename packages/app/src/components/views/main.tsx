import React, { useEffect, useRef, useState } from 'react';

import { ClickAwayListener, CssBaseline } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';

import { PanelStateContext } from '@sa-app/context/PanelState';
import { SAContext } from '@sa-app/context/SAContext';

import * as SALocalStorage from '@sa-app/hooks/SALocalStorage';

import { mainTheme } from '@sa-app/style';

import { CommandBar } from './CommandBar';
import { MainButton } from './MainButton';
import { MainMenu } from './MainMenu';
import { MainPanel } from './MainPanel';

import * as core from 'sa-core';

import { Hook, defaultStrategy, resolveStrategy } from 'sa-core';
import { SAEventBus } from 'sa-core/event-bus';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).sac = { ...core, ...sac };

const battleStrategyStorage = SALocalStorage.BattleStrategy;
const eventBus = new SAEventBus();

export default function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);
    const [lockMainPanel, toggleMainPanelLock] = useState(false);
    const mainRef = useRef(null);

    const [battleAuto, setBattleAuto] = useState(false);

    const handleShortCut = (e: KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
    };

    const handleClickAway = () => {
        if (!lockMainPanel) {
            toggleMainPanel(false);
        }
    };

    useEffect(() => {
        const handleBattleRoundEnd = () => {
            if (battleAuto) {
                resolveStrategy({
                    dsl: battleStrategyStorage.dsl,
                    snm: battleStrategyStorage.snm,
                    default: defaultStrategy,
                });
            }
        };

        document.body.addEventListener('keydown', handleShortCut);

        eventBus.hook(Hook.BattlePanel.panelReady, handleBattleRoundEnd);
        eventBus.hook(Hook.BattlePanel.roundEnd, handleBattleRoundEnd);

        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            eventBus.unmount();
        };
    }, [lockMainPanel, battleAuto]);

    return (
        <>
            <CssBaseline />
            <ThemeProvider theme={mainTheme}>
                <Container id="sa-main">
                    <SAContext.Provider
                        value={{
                            Battle: {
                                enableAuto: battleAuto,
                                updateAuto: setBattleAuto,
                            },
                        }}
                    >
                        <MainMenu />
                        <CommandBar show={isCommandBarOpen} />
                        <PanelStateContext.Provider
                            value={{
                                open: isMainPanelOpen,
                                setOpen: toggleMainPanel,
                                lock: lockMainPanel,
                                setLock: toggleMainPanelLock,
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClickAway}>
                                <div ref={mainRef}>
                                    <MainButton
                                        onClick={() => {
                                            toggleMainPanel((preState) => !preState);
                                        }}
                                    />
                                    <MainPanel
                                        show={isMainPanelOpen}
                                        lock={lockMainPanel}
                                        setLock={toggleMainPanelLock}
                                    />
                                </div>
                            </ClickAwayListener>
                        </PanelStateContext.Provider>
                    </SAContext.Provider>
                </Container>
            </ThemeProvider>
        </>
    );
}
