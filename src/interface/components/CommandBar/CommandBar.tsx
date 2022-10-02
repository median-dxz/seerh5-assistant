import { Box, Grow, styled } from '@mui/material';
import React from 'react';
import { CommandInput } from './CommandInput';

const CommandBarBox = styled(Box)`
    position: fixed;
    width: 40vw;
    min-width: 240px;
    left: 30vw;
    top: 10vh;
` as typeof Box;

interface Props {
    show: boolean;
}

const CommandInputRef = React.forwardRef<HTMLDivElement>((props, ref) => (
    <CommandBarBox>
        <div ref={ref} {...props}>
            <CommandInput />
        </div>
    </CommandBarBox>
));

export function CommandBar(props: Props) {
    return (
        <Grow in={props.show}>
            <CommandInputRef />
        </Grow>
    );
}
