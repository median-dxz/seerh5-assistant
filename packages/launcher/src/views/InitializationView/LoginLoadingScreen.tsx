import { CircularProgress, Paper, Typography } from '@mui/material';

export function LoginLoadingScreen({ loadingText }: { loadingText: string }) {
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
            <Typography>{loadingText || '加载中...'}</Typography>
        </Paper>
    );
}
