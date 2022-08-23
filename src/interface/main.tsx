import * as React from 'react';
import { createTheme } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';
import { useState } from 'react';
import { FunctionBar } from './components/function-bar';
import { MainMenu } from './components/menu-btn';

export function SaMain() {
    const toolBarTheme = createTheme({
        palette: {
            primary: {
                main: '#E7EBF0',
            },
        },
    });
    const [isFunctionBarShown, toggleFunctionBar] = useState(false);
    return (
        <div className="sa-main">
            <Container sx={{ margin: 2, display: 'flex', opacity: '0.75', alignItems: 'center' }}>
                <MainMenu menuClickHandler={() => toggleFunctionBar(!isFunctionBarShown)} />
                <ThemeProvider theme={toolBarTheme}>
                    <FunctionBar show={isFunctionBarShown} />
                </ThemeProvider>
            </Container>
        </div>
    );
}
