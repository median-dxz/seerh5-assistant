import { theme } from '@/style';
import { Paper as MuiPaper, styled } from '@mui/material';

export const Paper = styled(MuiPaper)`
    & {
        display: flex;
        padding: ${theme.spacing(4)};
        flex-direction: column;
    }
` as typeof MuiPaper;
