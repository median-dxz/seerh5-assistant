import { IconButton, styled, type IconButtonProps } from '@mui/material';

const StyledIconButton = styled(IconButton)`
    color: ${({ theme }) => theme.palette.text.primary};
    transition: ${({ theme }) => theme.transitions.create(['color', 'transform'])};
    &:hover {
        color: ${({ theme }) => theme.palette.primary.main};
    }
    &:active {
        transform: scale(0.9);
    }
`;

export function IconButtonNoRipple({ ...props }: Omit<IconButtonProps, 'disableRipple' | 'color'>) {
    return <StyledIconButton disableRipple size="small" {...props} />;
}
