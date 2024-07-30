import { useAppSelector } from '@/store';
import { Typography } from '@mui/material';

export function ErrorScreen() {
    const error = useAppSelector((state) => state.initialization.error);
    return (
        <Typography
            sx={{
                color: (theme) => theme.palette.secondary.main,
                fontFamily: (theme) => theme.fonts.input
            }}
        >
            {error}
        </Typography>
    );
}
