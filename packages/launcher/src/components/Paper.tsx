import { alpha, Paper as MuiPaper, styled } from '@mui/material';

export const Paper = styled(MuiPaper)`
    background-color: ${({ theme: { palette } }) => alpha(palette.primary.main, 0.08)};
    backdrop-filter: unset;
` as typeof MuiPaper;
