import { theme } from '@/style';
import { TableRow, alpha, styled } from '@mui/material';

export const SeaTableRow = styled(TableRow)`
    transition: ${theme.transitions.create(['background-color'])};
    &:last-child td,
    &:last-child th {
        border: 0;
    }
    &.Mui-selected {
        background-color: ${alpha(theme.palette.emphases.main, 0.12)};
    }
    &:hover,
    &.Mui-selected:hover {
        background-color: ${alpha(theme.palette.emphases.main, 0.18)};
    }
` as typeof TableRow;