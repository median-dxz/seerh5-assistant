import { alpha, createTheme, darken, lighten, type SxProps } from '@mui/material';
import { deepPurple } from '@mui/material/colors';

declare module '@mui/material/styles' {
    interface Palette {
        popup: {
            background: string;
        };
    }

    interface PaletteOptions {
        popup?: {
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

const border = `1px solid ${alpha(colors.primary, 0.24)}`;

const fonts = {
    input: `"Noto Sans SC", "Open Sans", consolas, monospace`,
    main: `MFShangHei, "Open Sans", "Noto Sans SC", Helvetica, Arial, sans-serif`,
    header: `"Noto Sans SC", system-ui, -apple-system, "Open Sans", "Helvetica Neue", sans-serif`,
};

export const theme = createTheme({
    boxShadow: `0 8px 16px rgba(0 0 0 / 24%)`,
    fonts,
    border,

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
        divider: alpha(colors.primary, 0.16),
        popup: {
            background: alpha(colors.secondary, 0.36),
        },
    },
    typography: {
        fontSize: 16,
        fontFamily: fonts.main,
        subtitle1: {
            fontSize: 20,
            fontFamily: fonts.header,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
        },
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
        MuiButton: {
            styleOverrides: {
                outlined: {
                    backgroundColor: alpha(colors.primary, 0.18),
                    border,
                    ':hover': {
                        backgroundColor: alpha(colors.primary, 0.24),
                        border,
                    },
                },
                contained: {
                    color: colors.text,
                    border,
                    backgroundColor: alpha(colors.secondary, 0.48),
                    ':hover': {
                        backgroundColor: alpha(darken(colors.secondary, 0.15), 0.48),
                    },
                    ':active': {
                        backgroundColor: alpha(lighten(colors.secondary, 0.15), 0.48),
                    },
                },
                outlinedInherit: {
                    border: `1px solid ${alpha(colors.text, 0.24)}`,
                    ':hover': {
                        border: `1px solid ${alpha(colors.text, 0.48)}`,
                    },
                },
            },
        },
        MuiTypography: {
            defaultProps: {
                variantMapping: {
                    subtitle1: 'h2',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(colors.primary, 0.18),
                    border: `1px solid ${alpha(colors.text, 0.24)}`,
                    fontFamily: fonts.input,
                },
            },
        },
    },
});

export const componentStyles: Record<string, SxProps> = {};
