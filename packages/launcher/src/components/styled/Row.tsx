import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';

export function Row({ children, sx, ...props }: StackProps) {
    return (
        <Stack
            sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                ...sx
            }}
            {...props}
        >
            {children}
        </Stack>
    );
}
