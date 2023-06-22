import { Box, Grow } from '@mui/material';
import { CommandInput } from '@sa-app/CommandInput';
import React from 'react';

interface Props {
    open: boolean;
}

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

export function CommandBar(props: Props) {
    return (
        <Grow in={props.open} unmountOnExit>
            <CommandInputRef />
        </Grow>
    );
}
