import { Box, Grow } from '@mui/material';
import { CommandInput } from '@sa-app/views/CommandInput';
import React from 'react';

interface Props {
    show: boolean;
}

const CommandInputRef = React.forwardRef<HTMLDivElement>((props, ref) => (
    <Box
        sx={{
            position: 'absolute',
            width: '40vw',
            minWidth: '240px',
            left: '30vw',
            top: '10vh',
            zIndex: 4,
        }}
    >
        <div ref={ref} {...props}>
            <CommandInput />
        </div>
    </Box>
));

export function CommandBar(props: Props) {
    return (
        <Grow in={props.show} unmountOnExit>
            <CommandInputRef />
        </Grow>
    );
}
