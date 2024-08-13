import { Typography } from '@mui/material';

import { LinerLoading } from '@/components/LinerLoading';
import { initializer } from '@/features/initializer';
import { useAppSelector } from '@/shared';

export function CoreLoadingScreen() {
    const loadingText = useAppSelector(initializer.loadingText);
    return (
        <>
            <Typography sx={{ color: (theme) => theme.palette.secondary.main }}>
                {loadingText || '等待游戏加载...'}
            </Typography>
            <LinerLoading sx={{ width: '100%' }} />
        </>
    );
}
