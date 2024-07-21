import { theme } from '@/style';
import { TextField as MuiTextField, styled } from '@mui/material';

export const SeaTextField = styled(MuiTextField)`
    & .MuiAutocomplete-inputRoot {
        box-shadow: ${theme.boxShadow};
        background-color: ${theme.palette.popup.background};
        backdrop-filter: blur(12px);
        font-family: ${theme.fonts.input};

        & fieldset {
            border-color: none;
            transition: ${theme.transitions.create(['border-color'])};
        }

        &.Mui-focused fieldset {
            border: 1px solid ${theme.palette.text.primary};
        }

        &:hover .MuiOutlinedInput-notchedOutline {
            border: 1px solid ${theme.palette.text.primary};
        }
    }
` as typeof MuiTextField;
