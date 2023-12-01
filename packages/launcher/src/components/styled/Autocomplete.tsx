import { Autocomplete as MuiAutocomplete } from '@mui/material';
import { styled } from '@mui/system';
import { theme } from '@sea/launcher/style';
import React from 'react';

export const SeaAutocomplete = styled<typeof MuiAutocomplete>(({ className, ...props }) => (
    <MuiAutocomplete {...props} classes={{ popper: className }} />
))`
    & .MuiAutocomplete-paper {
        border-radius: 0;
        background-color: ${theme.palette.background.default};
        box-shadow: ${theme.boxShadow};
        backdrop-filter: blur(12px);
    }
` as typeof MuiAutocomplete;
