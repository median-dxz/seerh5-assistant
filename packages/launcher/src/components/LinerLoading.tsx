import { Box, LinearProgress, styled, type BoxProps } from '@mui/material';

const StyledBox = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: stretch;
    flex-direction: column;
` as typeof Box;

export const LinerLoading = ({ ...props }: BoxProps) => (
    <StyledBox {...props}>
        <LinearProgress />
    </StyledBox>
);
