import { TextField } from '@mui/material';
import { styled } from '@mui/system';
import { mainColor } from '@sa-ui/style';

export const StyledTextField: typeof TextField = styled(TextField)`
    padding: 4px;
    --color-front-75: rgba(${mainColor.front} / 75%);
    --color-front-100: rgba(${mainColor.front} / 100%);
    --color-back-50: rgba(${mainColor.back} / 50%);
    &::after {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        width: 1em;
        height: 1em;
        border-top: 1px solid var(--color-front-100);
        border-left: 1px solid var(--color-front-100);
    }

    &::before {
        content: ' ';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 1em;
        height: 1em;
        border-bottom: 1px solid var(--color-front-100);
        border-right: 1px solid var(--color-front-100);
    }

    & .MuiFormLabel-root {
        top: initial;
        left: initial;
        color: var(--color-front-100);
        font-family: MFShangHei;
    }

    & .MuiAutocomplete-endAdornment {
        & .MuiAutocomplete-clearIndicator,
        & .MuiAutocomplete-popupIndicator {
            color: var(--color-front-100);
        }
    }

    & .MuiAutocomplete-inputRoot {
        box-shadow: 0 0 16px var(--color-front-75);
        background-color: rgba(10 55 118 / 50%);
        backdrop-filter: blur(7px);
        border-radius: 0;
        border: none;

        & .MuiAutocomplete-input {
            color: var(--color-front-100);
        }

        &.Mui-focused {
            border: none;
        }

        & fieldset {
            border-color: var(--color-front-75);
            transition: border-color 0.3s;
        }

        &:hover fieldset {
            border: 1px solid var(--color-front-100);
        }

        &.Mui-focused fieldset {
            border: 1px solid var(--color-front-75);
        }

        &.Mui-focused:hover fieldset {
            border: 1px solid var(--color-front-100);
        }
    }
`;
