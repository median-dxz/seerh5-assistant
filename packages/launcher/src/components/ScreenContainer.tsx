import { Box, styled } from '@mui/material';

export const ScreenContainer = styled(Box)`
    position: relative;
    display: flex;
    z-index: 1;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
` as typeof Box;
