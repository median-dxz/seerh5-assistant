import { useAppSelector } from '@/store';
import { CircularProgress, Paper, Typography } from '@mui/material';

export function LoginLoadingScreen() {
    const loadingItem = useAppSelector((state) => state.initialization.loadingItem);
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
            <Typography sx={{ fontFamily: (theme) => theme.fonts.input }}>{loadingItem || '加载中...'}</Typography>
        </Paper>
    );
}
