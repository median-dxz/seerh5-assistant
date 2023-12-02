import { theme } from '@/style';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/system';

export const SeaTextField = styled(MuiTextField)`
    & .MuiFormLabel-root {
        top: initial;
        left: initial;
    }

    & .MuiAutocomplete-inputRoot {
        box-shadow: ${theme.boxShadow};
        background-color: ${theme.palette.background.default};
        backdrop-filter: blur(12px);
        border-radius: 0;

        font-family: 'Open Sans', MFShangHei;
        &.Mui-focused {
            border: none;
        }

        & fieldset {
            border-color: none;
            transition: ${theme.transitions.create(['border-color'])};
        }

        &.Mui-focused fieldset {
            border: 1px solid ${theme.palette.primary.main};
        }

        &.Mui-focused:hover fieldset {
            border: 1px solid ${theme.palette.primary.main};
        }
    }
` as typeof MuiTextField;
