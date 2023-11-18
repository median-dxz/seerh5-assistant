import { Autocomplete as MuiAutocomplete } from '@mui/material';
import { styled } from '@mui/system';
import { saTheme } from '@sea-launcher/style';
import React from 'react';

export const SeaAutocomplete = styled<typeof MuiAutocomplete>(({ className, ...props }) => (
    <MuiAutocomplete {...props} classes={{ popper: className }} />
))`
    & .MuiAutocomplete-paper {
        border-radius: 0;
        background-color: ${saTheme.palette.background.default};
        box-shadow: ${saTheme.boxShadow};
        backdrop-filter: blur(12px);
    }
` as typeof MuiAutocomplete;