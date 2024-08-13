import { Typography } from '@mui/material';

import { initializer } from '@/features/initializer';
import { useAppSelector } from '@/shared';

export function ErrorScreen() {
    const error = useAppSelector(initializer.loadingText);
    return (
        <Typography
            sx={{
                color: (theme) => theme.palette.secondary.main
            }}
        >
            {error}
        </Typography>
    );
}
