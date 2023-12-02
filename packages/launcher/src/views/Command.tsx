import { CommandInput } from '@/views/CommandInput';
import { Box } from '@mui/material';
import React from 'react';

const CommandInputRef = React.forwardRef<HTMLDivElement>((props, ref) => (
    <Box
        sx={{
            position: 'absolute',
            left: '30vw',
            top: '10vh',
            width: '40vw',
            minWidth: '240px',
            zIndex: (theme) => theme.zIndex.snackbar,
        }}
    >
        <div ref={ref} {...props}>
            <CommandInput />
        </div>
    </Box>
));

export const Command = CommandInputRef;
