import { alpha, createTheme, type SxProps } from '@mui/material';
import { deepPurple } from '@mui/material/colors';

declare module '@mui/material/styles' {
    interface Palette {
        command: {
            background: string;
        };
    }

    interface PaletteOptions {
        command?: {
            background?: string;
        };
    }

    interface Theme {
        boxShadow: string;
        border: string;

        fonts: {
            input: string;
        };

        palette: Palette;
    }

    interface ThemeOptions {
        boxShadow?: string;
        border?: string;

        fonts?: {
            input: string;
        };

        palette?: PaletteOptions;
    }
}

const colors = {
    primary: deepPurple[200],
    secondary: deepPurple[500],
    text: '#e1f5fe',
    paper: '#211d22',
};

export const theme = createTheme({
    boxShadow: `0 8px 16px rgba(0 0 0 / 24%)`,
    fonts: {
        input: '"Noto Sans SC", "Open Sans", monospace',
    },
    border: `1px solid ${alpha('#81d4fa', 0.16)}`,

    spacing: 4,
    palette: {
        mode: 'dark',
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: colors.secondary,
        },
        text: {
            primary: colors.text,
        },
        background: {
            default: alpha(colors.paper, 0.24),
            paper: alpha(colors.primary, 0.08),
        },
        divider: alpha('#81d4fa', 0.16),
        command: {
            background: alpha('#4a148c', 0.24),
        },
    },
    typography: {
        fontSize: 16,
        fontFamily: `MFShangHei, "Open Sans", "Noto Sans SC", Helvetica, Arial, sans-serif`,
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
                    backgroundColor: alpha(colors.primary, 0.24),
                    borderRadius: '12px',
                    border: '4px solid transparent',
                    backgroundClip: 'content-box',
                },
                '::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: alpha(colors.primary, 0.48),
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: { backgroundColor: alpha('#000', 0.24) },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: alpha(colors.primary, 0.6),
                    backdropFilter: 'blur(4px)',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(colors.primary, 0.24),
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: `0 8px 16px rgba(0 0 0 / 24%)`,
                    display: 'flex',
                },
            },
        },
    },
});

export const componentStyles: Record<string, SxProps> = {};
