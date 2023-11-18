import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/system';
import { saTheme } from '@sea-launcher/style';

export const SaTextField: typeof MuiTextField = styled(MuiTextField)`
    & .MuiFormLabel-root {
        top: initial;
        left: initial;
    }

    & .MuiAutocomplete-inputRoot {
        box-shadow: ${saTheme.boxShadow};
        background-color: ${saTheme.palette.background.default};
        backdrop-filter: blur(12px);
        border-radius: 0;

        font-family: 'Open Sans', MFShangHei;
        &.Mui-focused {
            border: none;
        }

        & fieldset {
            border-color: none;
            transition: ${saTheme.transitions.create(['border-color'])};
        }

        &.Mui-focused fieldset {
            border: 1px solid ${saTheme.palette.primary.main};
        }

        &.Mui-focused:hover fieldset {
            border: 1px solid ${saTheme.palette.primary.main};
        }
    }
`;
