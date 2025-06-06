import { theme } from '@/theme';
import { TableRow as MuiTabRow, alpha, styled } from '@mui/material';

const radius = 6;

export const TableRow = styled(MuiTabRow)`
    transition: ${theme.transitions.create(['background-color'])};

    td {
        border: 0;
    }

    td:first-of-type,
    th:first-of-type {
        border-radius: ${radius}px 0 0 ${radius}px;
    }

    td:last-of-type,
    th:last-of-type {
        border-radius: 0 ${radius}px ${radius}px 0;
    }

    &.Mui-selected {
        background-color: ${alpha(theme.palette.primary.main, 0.12)};
    }
    &:hover,
    &.Mui-selected:hover {
        background-color: ${alpha(theme.palette.primary.main, 0.18)};
        filter: drop-shadow(${theme.boxShadow});
    }
` as typeof MuiTabRow;
