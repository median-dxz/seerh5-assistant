import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, ThemeProvider } from '@mui/system';
import React, { Fragment, useEffect, useState } from 'react';
import { CommandBar } from './components/CommandBar';
import { MainMenu } from './components/MainMenu';
import { MainPanel } from './components/MainPanel/MainPanel';

// createTheme({
//     palette: {
//         primary: {
//             main: '#E7EBF0',
//         },
//     },
// });

const mainTheme = createTheme({
    typography: {
        fontSize: 16,
    },
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: 'rgba(33 150 243 / 45%)',
                    backdropFilter: 'blur(6px)',
                },
            },
        },
    },
});

export function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);

    const shortCutHandler = function (e: KeyboardEvent | React.KeyboardEvent) {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
        if (e.key === 's' && e.ctrlKey) {
            toggleMainPanel((preState) => !preState);
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
                <div id="sa-main">
                    <Container sx={{ m: 2, display: 'flex', alignItems: 'center' }}>
                        <MainMenu />
                    </Container>
                </div>
                <CommandBar show={isCommandBarOpen} />
                <MainPanel show={isMainPanelOpen} />
            </ThemeProvider>
        </Fragment>
    );
}
