import type { PaperProps } from '@mui/material';
import { Paper as MuiPaper } from '@mui/material';
import React from 'react';

export function Paper({ children, sx, ...props }: PaperProps) {
    return (
        <MuiPaper sx={{ p: 4, flexDirection: 'column', alignItems: 'baseline', ...sx }} {...props}>
            {children}
        </MuiPaper>
    );
}
