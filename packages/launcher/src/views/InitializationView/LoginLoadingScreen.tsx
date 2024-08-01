import { CircularProgress, Paper, Typography } from '@mui/material';

import { initializer } from '@/features/initializer';
import { useAppSelector } from '@/shared';

export function LoginLoadingScreen() {
    const loadingText = useAppSelector(initializer.loadingText);
    return (
        <Paper
            sx={{
                width: `440px`,
                height: `200px`,
                backgroundImage: 'none',
                backdropFilter: 'blur(8px)',
                bgcolor: ({ palette }) => palette.extendedBackground.emphasize,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
            }}
        >
            <CircularProgress size={'1.5rem'} />
            <Typography sx={{ fontFamily: (theme) => theme.fonts.input }}>{loadingText || '加载中...'}</Typography>
        </Paper>
    );
}
