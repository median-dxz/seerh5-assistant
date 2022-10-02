import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, ThemeProvider } from '@mui/system';
import React, { Fragment, useEffect, useState } from 'react';
import { CommandBar } from './components/CommandBar';
import { FunctionBar } from './components/function-bar';
import { MainMenu } from './components/menu-btn';

const toolBarTheme = createTheme({
    palette: {
        primary: {
            main: '#E7EBF0',
        },
    },
});

const mainTheme = createTheme({
    typography: {
        fontSize: 16,
    },
});

export function SaMain() {
    const [isFunctionBarShown, toggleFunctionBar] = useState(false);
    const [isCommandBarShown, toggleCommandBar] = useState(false);

    const shortCutHandler = function (e: KeyboardEvent | React.KeyboardEvent) {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            // console.log(isCommandBarShown, !isCommandBarShown);
            e.preventDefault();
        }
    };

    useEffect(() => {
        // canvas.addEventListener('keydown', shortCutHandler);
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
                    <Container sx={{ margin: 2, display: 'flex', opacity: '0.75', alignItems: 'center' }}>
                        <MainMenu menuClickHandler={() => toggleFunctionBar(!isFunctionBarShown)} />
                        <ThemeProvider theme={toolBarTheme}>
                            <FunctionBar show={isFunctionBarShown} />
                        </ThemeProvider>
                    </Container>
                </div>
                <CommandBar show={isCommandBarShown} />
            </ThemeProvider>
        </Fragment>
    );
}
