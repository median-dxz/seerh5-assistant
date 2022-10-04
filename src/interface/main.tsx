import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, ThemeProvider } from '@mui/system';
import React, { Fragment, useEffect, useState } from 'react';
import { CommandBar } from './components/CommandBar';
import { MainMenu } from './components/MainMenu';

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
});

export function SaMain() {
    const [isCommandBarShown, toggleCommandBar] = useState(false);

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
                <div id="sa-main">
                    <Container sx={{ margin: 2, display: 'flex', opacity: '0.75', alignItems: 'center' }}>
                        <MainMenu />
                    </Container>
                </div>
                <CommandBar show={isCommandBarShown} />
            </ThemeProvider>
        </Fragment>
    );
}
