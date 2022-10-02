import { TextField } from '@mui/material';
import { styled } from '@mui/system';

export const mainColor = `211 244 254`;
export const StyledTextField: typeof TextField = styled(TextField)`
    padding: 4px;
    --main-color: rgba(${mainColor} / 75%);
    --main-color-full: rgb(${mainColor});
    &::after {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        width: 1em;
        height: 1em;
        border-top: 1px solid var(--main-color-full);
        border-left: 1px solid var(--main-color-full);
    }

    &::before {
        content: ' ';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 1em;
        height: 1em;
        border-bottom: 1px solid var(--main-color-full);
        border-right: 1px solid var(--main-color-full);
    }

    & .MuiFormLabel-root {
        top: initial;
        left: initial;
        color: var(--main-color-full);
        font-family: MFShangHei;
    }

    & .MuiAutocomplete-endAdornment {
        & .MuiAutocomplete-clearIndicator,
        & .MuiAutocomplete-popupIndicator {
            color: var(--main-color-full);
        }
    }

    & .MuiAutocomplete-inputRoot {
        box-shadow: 0 0 16px var(--main-color);
        background-color: rgba(10 55 118 / 50%);
        backdrop-filter: blur(7px);
        border-radius: 0;
        border: none;

        & .MuiAutocomplete-input {
            color: var(--main-color-full);
        }

        &.Mui-focused {
            border: none;
        }

        & fieldset {
            border-color: var(--main-color);
            transition: border-color 0.3s;
        }

        &:hover fieldset {
            border: 1px solid var(--main-color-full);
        }

        &.Mui-focused fieldset {
            border: 1px solid var(--main-color);
        }

        &.Mui-focused:hover fieldset {
            border: 1px solid var(--main-color-full);
        }
    }
`;
