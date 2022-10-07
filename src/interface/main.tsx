import { CssBaseline } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';
import React, { Fragment, useEffect, useState } from 'react';
import { CommandBar } from './components/CommandBar';
import { MainButton } from './components/MainButton';
import { MainMenu } from './components/MainMenu';
import { MainPanel } from './components/MainPanel';
import { mainTheme } from './style';

export function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);

    const shortCutHandler = function (e: KeyboardEvent | React.KeyboardEvent) {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
    };

    useEffect(() => {
        document.body.addEventListener('keydown', shortCutHandler);
        return () => {
            document.body.removeEventListener('keydown', shortCutHandler);
        };
    }, []);

    return (
        <Fragment>
            <CssBaseline />
            <ThemeProvider theme={mainTheme}>
                <Container id="sa-main">
                    <MainMenu />
                    <MainButton
                        onClick={() => {
                            toggleMainPanel((preState) => !preState);
                        }}
                    />
                    <CommandBar show={isCommandBarOpen} />
                    <MainPanel show={isMainPanelOpen} />
                </Container>
            </ThemeProvider>
        </Fragment>
    );
}
