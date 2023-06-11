import { Autocomplete as MuiAutocomplete } from '@mui/material';
import { styled } from '@mui/system';
import { saTheme } from '@sa-app/style';
import React from 'react';

export const SaAutocomplete = styled<typeof MuiAutocomplete>(({ className, ...props }) => (
    <MuiAutocomplete {...props} classes={{ popper: className }} />
))`
    & .MuiAutocomplete-paper {
        border-radius: 0;
        backdrop-filter: blur(12px);
        background-color: ${saTheme.palette.background.default};
        box-shadow: ${saTheme.boxShadow};
        color: ${saTheme.palette.text.primary};
    }
` as typeof MuiAutocomplete;
