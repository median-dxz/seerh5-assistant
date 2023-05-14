import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ClickAwayListener, CssBaseline } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';

import { PanelStateContext } from '@sa-app/context/PanelState';
import { SAContext } from '@sa-app/context/SAContext';

import { SALocalStorage } from '@sa-app/provider/GlobalConfig';

import { mainTheme } from '@sa-app/style';

import { CommandBar } from './CommandBar';
import { MainButton } from './MainButton';
import { MainMenu } from './MainMenu';
import { MainPanel } from './MainPanel';

import { Hook, SABattle, SAEventTarget } from 'seerh5-assistant-core';

const { defaultStrategy, resolveStrategy } = SABattle;

import * as saco from 'seerh5-assistant-core';

window.sac = { ...saco, ...sac };

const battleStrategyStorage = SALocalStorage.BattleStrategy;

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

    const handleBattleRoundEnd = useCallback(() => {
        if (battleAuto) {
            resolveStrategy({
                dsl: battleStrategyStorage.dsl,
                snm: battleStrategyStorage.snm,
                default: defaultStrategy,
            });
        }
    }, [battleAuto]);
    useEffect(() => {
        document.body.addEventListener('keydown', handleShortCut);
        SAEventTarget.on(Hook.BattlePanel.panelReady, handleBattleRoundEnd);
        SAEventTarget.on(Hook.BattlePanel.roundEnd, handleBattleRoundEnd);
        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            SAEventTarget.on(Hook.BattlePanel.panelReady, handleBattleRoundEnd);
            SAEventTarget.on(Hook.BattlePanel.roundEnd, handleBattleRoundEnd);
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
                                        onClick={(e) => {
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
