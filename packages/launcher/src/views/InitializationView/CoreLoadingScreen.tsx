import { LinerLoading } from '@/components/LinerLoading';
import { useAppSelector } from '@/store';
import { Typography } from '@mui/material';

export function CoreLoadingScreen() {
    const loadingItem = useAppSelector((state) => state.initialization.loadingItem);
    return (
        <>
            <Typography
                sx={{ color: (theme) => theme.palette.secondary.main, fontFamily: (theme) => theme.fonts.input }}
            >
                {loadingItem || '等待游戏加载...'}
            </Typography>
            <LinerLoading sx={{ width: '100%' }} />
        </>
    );
}
