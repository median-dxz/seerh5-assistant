import { createTheme } from '@mui/material';
import { lime } from '@mui/material/colors';

export const mainColor = {
    front: `211 244 254`,
    back: '10 55 118',
};

export const mainTheme = createTheme({
    typography: {
        fontSize: 16,
        fontFamily: `MFShangHei, Roboto, Helvetica, Arial, sans-serif`,
    },
    palette: {
        primary: {
            light: lime[400],
            dark: lime[600],
            main: lime['A200'],
        },
        text: {
            primary: 'rgba(211, 244, 254, 87%)',
            secondary: 'rgba(211, 244, 254, 60%)',
            disabled: 'rgba(211, 244, 254, 38%)',
        },
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
