import { Box, CircularProgress, Typography, type BoxProps } from '@mui/material';

type DataLoadingProps = BoxProps & {
    error?: string;
    loadingText?: string;
};

export const DataLoading = ({ sx, loadingText = '加载数据中', error }: DataLoadingProps) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            ...sx
        }}
    >
        {!error ? (
            <>
                <CircularProgress size="1.5rem" />
                <Typography>{loadingText}</Typography>
            </>
        ) : (
            <Typography
                sx={{
                    fontFamily: (theme) => theme.fonts.input
                }}
            >
                {error}
            </Typography>
        )}
    </Box>
);
