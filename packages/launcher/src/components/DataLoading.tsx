import { Box, CircularProgress, styled, Typography, type BoxProps } from '@mui/material';

type DataLoadingProps = BoxProps & {
    error?: string;
    loadingText?: string;
};

const StyledBox = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
` as typeof Box;

export const DataLoading = ({ loadingText = '加载数据中', error, ...props }: DataLoadingProps) => (
    <StyledBox {...props}>
        {!error ? (
            <>
                <CircularProgress size="1.5rem" />
                <Typography color="error">{loadingText}</Typography>
            </>
        ) : (
            <Typography>{error}</Typography>
        )}
    </StyledBox>
);
