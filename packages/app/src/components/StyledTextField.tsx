import { TextField } from '@mui/material';
import { styled } from '@mui/system';
import { mainTheme } from '@sa-app/style';

export const StyledTextField: typeof TextField = styled(TextField)`
    padding: 4px;

    &::after {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        width: 1em;
        height: 1em;
        border-top: 1px solid ${mainTheme.palette.secondary.main};
        border-left: 1px solid ${mainTheme.palette.secondary.main};
    }

    &::before {
        content: ' ';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 1em;
        height: 1em;
        border-bottom: 1px solid ${mainTheme.palette.secondary.main};
        border-right: 1px solid ${mainTheme.palette.secondary.main};
    }

    & .MuiFormLabel-root {
        top: initial;
        left: initial;
        color: ${mainTheme.palette.secondary.main};
        font-family: MFShangHei;
    }

    & .MuiAutocomplete-endAdornment {
        & .MuiAutocomplete-clearIndicator,
        & .MuiAutocomplete-popupIndicator {
            color: ${mainTheme.palette.secondary.main};
        }
    }

    & .MuiAutocomplete-inputRoot {
        box-shadow: 0 0 16px rgba(0 0 0 /24%);
        background-color: rgba(10 55 118 / 50%);
        backdrop-filter: blur(7px);
        border-radius: 0;
        border: none;

        & .MuiAutocomplete-input {
            color: ${mainTheme.palette.secondary.main};
        }

        &.Mui-focused {
            border: none;
        }

        & fieldset {
            border-color: ${mainTheme.palette.secondary.main};
            transition: border-color 0.3s;
        }

        &:hover fieldset {
            border: 1px solid ${mainTheme.palette.secondary.main};
        }

        &.Mui-focused fieldset {
            border: 1px solid ${mainTheme.palette.secondary.main};
        }

        &.Mui-focused:hover fieldset {
            border: 1px solid ${mainTheme.palette.secondary.main};
        }
    }
`;
