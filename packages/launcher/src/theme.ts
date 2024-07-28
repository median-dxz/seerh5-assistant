import { deepPurple } from '@mui/material/colors';
import { alpha, createTheme, darken, lighten } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        extendedBackground: {
            popup: string;
            emphasize: string;
        };
    }

    interface PaletteOptions {
        extendedBackground?: Partial<Palette['extendedBackground']>;
    }

    interface Theme {
        boxShadow: string;
        border: string;

        fonts: {
            input: string;
            property: string;
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
    emphasize: '#140b24',
    popup: '#2f2148'
};

const border = `1px solid ${alpha(colors.primary, 0.24)}`;

const fonts = {
    input: `"Noto Sans SC", "Open Sans", consolas, monospace`,
    property: `"Open Sans", MFShangHei, system-ui, -apple-system, "Open Sans", "Helvetica Neue", sans-serif`,
    main: `MFShangHei, "Open Sans", "Noto Sans SC", Helvetica, Arial, sans-serif`,
    header: `"Noto Sans SC", system-ui, -apple-system, "Open Sans", "Helvetica Neue", sans-serif`
};

export const theme = createTheme({
    fonts,
    boxShadow: `0 8px 16px rgba(0 0 0 / 24%)`,
    border: `1px solid ${alpha(colors.primary, 0.24)}`,
    spacing: 4,
    palette: {
        mode: 'dark',
        primary: {
            main: colors.primary
        },
        secondary: {
            main: colors.secondary
        },
        text: {
            primary: colors.text
        },
        background: {
            default: alpha('#fff', 0.24),
            paper: alpha(colors.primary, 0.08)
        },
        divider: alpha(colors.primary, 0.16),
        extendedBackground: {
            popup: alpha(colors.popup, 0.88),
            emphasize: alpha(colors.emphasize, 0.88)
        }
    },
    typography: {
        fontSize: 16,
        fontFamily: fonts.main,
        h2: {
            fontSize: 20,
            fontFamily: fonts.header,
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
        }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '::-webkit-scrollbar': {
                    width: '12px',
                    height: '12px'
                },
                '::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent'
                },
                '::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(colors.primary, 0.24),
                    borderRadius: '12px',
                    border: '4px solid transparent',
                    backgroundClip: 'content-box'
                },
                '::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: alpha(colors.primary, 0.48)
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: { backgroundColor: alpha('#000', 0.24) }
            }
        },
        MuiStack: {
            defaultProps: {
                spacing: 4,
                useFlexGap: true
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: alpha(colors.primary, 0.6),
                    backdropFilter: 'blur(4px)'
                }
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(colors.primary, 0.24)
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme: { boxShadow } }) => ({
                    boxShadow,
                    display: 'flex',
                    flexDirection: 'column'
                })
            }
        },
        MuiMenu: {
            styleOverrides: {
                list: {
                    backgroundColor: alpha(colors.secondary, 0.88),
                    overflowY: 'auto'
                }
            }
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    backdropFilter: 'blur(8px)'
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    backgroundColor: alpha(colors.popup, 0.88),
                    backdropFilter: 'blur(4px)'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                outlined: {
                    backgroundColor: alpha(colors.primary, 0.18),
                    border,
                    ':hover': {
                        backgroundColor: alpha(colors.primary, 0.24),
                        border: `1px solid ${alpha(colors.primary, 0.48)}`
                    }
                },
                contained: {
                    color: colors.text,
                    border: 'none',
                    backgroundColor: colors.secondary,
                    '&:hover': {
                        backgroundColor: lighten(colors.secondary, 0.1),
                        boxShadow: `0 0 8px ${alpha(lighten(colors.secondary, 0.1), 0.24)}`
                    },
                    '&:active': {
                        backgroundColor: darken(colors.secondary, 0.24),
                        boxShadow: `0 0 8px ${alpha(darken(colors.secondary, 0.24), 0.24)}`
                    },
                    boxShadow: `0 0 4px ${alpha(colors.secondary, 0.24)}`
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(colors.secondary, 0.18),
                    border: `1px solid ${alpha(colors.text, 0.24)}`,
                    fontFamily: fonts.input
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: ({ theme: { boxShadow } }) => ({
                    width: '100%',
                    boxShadow,
                    backdropFilter: 'blur(8px)',
                    backgroundColor: alpha(colors.secondary, 0.8),
                    fontFamily: fonts.input
                }),
                listbox: {
                    width: '100%'
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme: { transitions, palette } }) => ({
                    '& .MuiOutlinedInput-notchedOutline': {
                        transition: transitions.create(['border-color'])
                    },
                    '& input[disabled] ~ .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${alpha(palette.text.primary, 0.12)}`
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${alpha(palette.text.primary, 0.48)}`
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${alpha(palette.primary.main, 0.64)}`
                    }
                })
            }
        }
    }
});
