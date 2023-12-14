import { theme } from '@/style';
import { Autocomplete as MuiAutocomplete } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

export const SeaAutocomplete = styled<typeof MuiAutocomplete>(({ className, ...props }) => (
    <MuiAutocomplete {...props} classes={{ popper: className }} />
))`
    & .MuiAutocomplete-paper {
        width: 100%;
        box-shadow: ${theme.boxShadow};
        backdrop-filter: blur(12px);
        background-color: ${theme.palette.command.background};
        font-family: ${theme.fonts.input};
        & .MuiAutocomplete-listbox {
            width: 100%;
        }
    }
` as typeof MuiAutocomplete;
