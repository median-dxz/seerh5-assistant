import { IconButton, styled, type IconButtonProps } from '@mui/material';
import React from 'react';

const StyledIconButton = styled(IconButton)`
    color: ${({ theme }) => theme.palette.text.primary};
    transition: ${({ theme }) => theme.transitions.create('color')};
    &:hover {
        color: ${({ theme }) => theme.palette.primary.main};
    }
`;

export function IconButtonNoRipple({ ...props }: Omit<IconButtonProps, 'disableRipple' | 'color'>) {
    return <StyledIconButton disableRipple size="small" {...props} />;
}
