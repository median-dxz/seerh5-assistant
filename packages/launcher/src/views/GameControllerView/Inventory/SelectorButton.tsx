import { PopupMenuButton, type PopupMenuButtonProps } from '@/components/PopupMenuButton';
import { Box } from '@mui/material';

export function SelectorButton<T, P extends object>({ children, ...props }: PopupMenuButtonProps<T, P>) {
    return (
        <PopupMenuButton
            buttonProps={{
                sx: { width: '100%', padding: '6px 12px', justifyContent: 'start' }
            }}
            {...props}
        >
            <Box
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                }}
            >
                {children}
            </Box>
        </PopupMenuButton>
    );
}
