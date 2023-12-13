import { alpha, createTheme } from '@mui/material';

declare module '@mui/material/styles' {
    interface Palette {
        emphases: Palette['primary'];
    }

    interface PaletteOptions {
        emphases?: PaletteOptions['primary'];
    }

    interface Theme {
        boxShadow: string;
        palette: Palette;
    }

    interface ThemeOptions {
        boxShadow?: string;
    }
}

const colors = {
    primary: '#b3e5fc',
    secondary: '#03a9f4',
    text: '#e1f5fe',
    paper: '#1e88e5',
};

export const theme = createTheme({
    boxShadow: `0 8px 16px rgba(0 0 0 / 24%)`,
    spacing: 4,
    palette: {
        mode: 'dark',
        emphases: {
            main: '#ffeb3b',
        },
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: colors.secondary,
        },
        text: {
            primary: colors.text,
            secondary: alpha(colors.text, 0.75),
        },
        background: {
            default: alpha(colors.paper, 0.25),
            paper: colors.paper,
        },
    },
    typography: {
        fontSize: 16,
        fontFamily: `MFShangHei, Open Sans, Helvetica, Arial, sans-serif`,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '::-webkit-scrollbar': {
                    width: '12px',
                    height: '12px',
                },
                '::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(colors.primary, 0.25),
                    borderRadius: '12px',
                    border: '4px solid transparent',
                    backgroundClip: 'content-box',
                },
                '::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: alpha(colors.primary, 0.4),
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: { backgroundColor: alpha('#000', 0.15) },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: alpha(colors.paper, 0.45),
                    backdropFilter: 'blur(4px)',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha('#fff', 0.33),
                },
            },
        }
    },
});
