import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ClickAwayListener, CssBaseline } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';

import { PanelStateContext } from '@sa-app/context/PanelState';
import { SAContext } from '@sa-app/context/SAContext';
import { useCore } from '@sa-app/provider/useCore';
import { mainTheme } from '@sa-app/style';
import { AutoBattle } from 'seerh5-assistant-core';
import { CommandBar } from './CommandBar';
import { MainButton } from './MainButton';
import { MainMenu } from './MainMenu';
import { MainPanel } from './MainPanel';

import { SAEventTarget } from 'seerh5-assistant-core';
const { Battle, Const } = useCore();
const { defaultStrategy, resolveStrategy } = Battle;
const { EVENTS } = Const;

export default function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);
    const [lockMainPanel, toggleMainPanelLock] = useState(false);
    const mainRef = useRef(null);

    const [battleStrategy, setBattleStrategy] = useState(() => {
        let item;
        let dsl: string[][] = [];
        let snm: string[][] = [];
        item = window.localStorage.getItem('BattleStrategyDSL');
        item && (dsl = JSON.parse(item));
        item = window.localStorage.getItem('BattleStrategySNM');
        item && (snm = JSON.parse(item));
        return { default: defaultStrategy, dsl: dsl, snm: snm } as AutoBattle.Strategy;
    });
    const [battleAuto, setBattleAuto] = useState(false);
    const updateBattleStrategy = useCallback(
        (strategy: AutoBattle.Strategy) => {
            setBattleStrategy(strategy);
            let item;
            item = strategy.dsl;
            item && window.localStorage.setItem('BattleStrategyDSL', JSON.stringify(item));
            item = strategy.snm;
            item && window.localStorage.setItem('BattleStrategySNM', JSON.stringify(item));
        },
        [battleStrategy]
    );

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
            resolveStrategy(battleStrategy);
        }
    }, [battleAuto, battleStrategy]);

    useEffect(() => {
        document.body.addEventListener('keydown', handleShortCut);
        SAEventTarget.addEventListener(EVENTS.BattlePanel.panelReady, handleBattleRoundEnd);
        SAEventTarget.addEventListener(EVENTS.BattlePanel.roundEnd, handleBattleRoundEnd);
        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            SAEventTarget.removeEventListener(EVENTS.BattlePanel.panelReady, handleBattleRoundEnd);
            SAEventTarget.removeEventListener(EVENTS.BattlePanel.roundEnd, handleBattleRoundEnd);
        };
    }, [lockMainPanel, battleAuto, battleStrategy]);

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
                                strategy: battleStrategy,
                                updateStrategy: updateBattleStrategy,
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
