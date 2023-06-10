import { createTheme } from '@mui/material';
import { indigo, yellow } from '@mui/material/colors';

export const mainTheme = createTheme({
    typography: {
        fontSize: 16,
        fontFamily: `MFShangHei, Open Sans, Helvetica, Arial, sans-serif`,
    },
    palette: {
        primary: yellow,
        secondary: indigo,
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
