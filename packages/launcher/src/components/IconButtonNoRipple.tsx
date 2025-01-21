import { IconButton, styled, type IconButtonProps } from '@mui/material';

export const IconButtonNoRipple = styled(({ ...props }: Omit<IconButtonProps, 'disableRipple' | 'color'>) => (
    <IconButton disableRipple size="small" {...props} />
))`
    color: ${({ theme: { palette } }) => palette.text.primary};
    transition: ${({ theme: { transitions } }) =>
        transitions.create(['color', 'transform'], { easing: 'cubic-bezier(0, 1, 0.32, 1.28)' })};
    &:hover {
        color: ${({ theme: { palette } }) => palette.primary.main};
    }
    &:active {
        transform: scale(0.9);
    }
` as typeof IconButton;
