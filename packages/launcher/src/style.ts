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
    }

    interface ThemeOptions {
        boxShadow?: string;
    }
}

const colors = {
    primary: '#b3e5fc',
    text: '#e1f5fe',
    paper: '#1e88e5',
};

export const theme = createTheme({
    boxShadow: `0 8px 16px rgba(0 0 0 / 24%)`,
    palette: {
        mode: 'dark',
        emphases: {
            main: '#ffeb3b',
        },
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: '#03a9f4',
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
                    width: 8,
                    height: 8,
                },
                '::-webkit-scrollbar-track': {
                    backgroundColor: alpha(colors.primary, 0.08),
                },
                '::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(colors.primary, 0.5),
                },
                '::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: colors.primary,
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: { backgroundColor: 'rgba(0, 0, 0, 0.15)' },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: 'rgba(33 150 243 / 45%)',
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
        },
    },
});
