import { Typography } from '@mui/material';

import { LinerLoading } from '@/components/LinerLoading';

export function CoreLoadingScreen({ loadingText }: { loadingText: string }) {
    return (
        <>
            <Typography sx={{ color: (theme) => theme.palette.secondary.main }}>
                {loadingText || '等待游戏加载...'}
            </Typography>
            <LinerLoading sx={{ width: '100%' }} />
        </>
    );
}
