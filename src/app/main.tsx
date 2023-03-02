import { CssBaseline } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';
import { AutoBattle, defaultStrategy, resolveStrategy } from '@sa-core/battle';
import { EVENTS } from '@sa-core/const';
import React, { useCallback, useEffect, useState } from 'react';
import { CommandBar } from './components/views/CommandBar';
import { MainButton } from './components/views/MainButton';
import { MainMenu } from './components/views/MainMenu';
import { MainPanel } from './components/views/MainPanel';
import { PanelStateContext } from './context/PanelState';
import { SAContext } from './context/SAContext';
import { mainTheme } from './style';

export function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);
    const [lockMainPanel, toggleMainPanelLock] = useState(false);

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

    const { SAEventTarget } = window;

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

    const handleClick = (e: MouseEvent) => {
        if (
            e.button === 0 &&
            document.querySelector('.MuiDialog-root[role=presentation]') == null &&
            document.querySelector('.MuiPopover-root[role=presentation]') == null &&
            !lockMainPanel
        ) {
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
        document.body.addEventListener('click', handleClick);
        SAEventTarget.addEventListener(EVENTS.BattlePanel.panelReady, handleBattleRoundEnd);
        SAEventTarget.addEventListener(EVENTS.BattlePanel.roundEnd, handleBattleRoundEnd);
        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            document.body.removeEventListener('click', handleClick);
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
                        <MainButton
                            onClick={(e) => {
                                toggleMainPanel((preState) => !preState);
                                e.nativeEvent.stopPropagation();
                            }}
                        />
                        <CommandBar show={isCommandBarOpen} />
                        <PanelStateContext.Provider
                            value={{
                                open: isMainPanelOpen,
                                setOpen: toggleMainPanel,
                                lock: lockMainPanel,
                                setLock: toggleMainPanelLock,
                            }}
                        >
                            <MainPanel show={isMainPanelOpen} lock={lockMainPanel} setLock={toggleMainPanelLock} />
                        </PanelStateContext.Provider>
                    </SAContext.Provider>
                </Container>
            </ThemeProvider>
        </>
    );
}
