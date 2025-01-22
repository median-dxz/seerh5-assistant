import { Typography } from '@mui/material';

import { ScreenContainer } from '@/components/ScreenContainer';

export interface ErrorScreenProps {
    error: string;
}

export function ErrorScreen({ error }: ErrorScreenProps) {
    return (
        <ScreenContainer sx={{ bgcolor: '#fff' }}>
            <Typography
                sx={{
                    color: (theme) => theme.palette.secondary.main
                }}
            >
                {error}
            </Typography>
        </ScreenContainer>
    );
}
