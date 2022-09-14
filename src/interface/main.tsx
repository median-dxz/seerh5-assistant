import { createTheme } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';
import React, { useState, useEffect, KeyboardEventHandler } from 'react';
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

    const shortCutHandler = (e: KeyboardEvent | React.KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            console.log('emm');
            e.preventDefault();
        }
    };
    
    useEffect(() => {
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        canvas.setAttribute('tabindex', '-1');
        canvas.addEventListener('keydown', shortCutHandler);
        return () => {
            canvas.removeEventListener('keydown', shortCutHandler);
        };
    }, []);

    const [isFunctionBarShown, toggleFunctionBar] = useState(false);
    return (
        <div id="sa-main" onKeyDown={shortCutHandler}>
            <Container sx={{ margin: 2, display: 'flex', opacity: '0.75', alignItems: 'center' }}>
                <MainMenu menuClickHandler={() => toggleFunctionBar(!isFunctionBarShown)} />
                <ThemeProvider theme={toolBarTheme}>
                    <FunctionBar show={isFunctionBarShown} />
                </ThemeProvider>
            </Container>
        </div>
    );
}
