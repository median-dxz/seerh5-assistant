import { TableRow, alpha, styled } from '@mui/material';
import { saTheme } from '@sa-app/style';


export const SaTableRow = styled(TableRow)`
    transition: ${saTheme.transitions.create(['background-color'])};
    &:last-child td,
    &:last-child th {
        border: 0;
    }
    &.Mui-selected {
        background-color: ${alpha(saTheme.palette.emphases.main, 0.12)};
    }
    &:hover,
    &.Mui-selected:hover {
        background-color: ${alpha(saTheme.palette.emphases.main, 0.18)};
    }
` as typeof TableRow;
