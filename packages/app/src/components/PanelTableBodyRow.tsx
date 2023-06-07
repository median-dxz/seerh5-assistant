import {
    styled, TableRow,
    TableRowProps
} from '@mui/material';


export const PanelTableBodyRow = styled(TableRow)<TableRowProps>(() => ({
    '&:last-child td, &:last-child th': { border: 0 },
    transition: 'all 0.3s ease-in-out',
    '&.Mui-selected': {
        backgroundColor: `rgba(231 247 67 / 18%)`,
    },
    '&:hover, &.Mui-selected:hover': {
        backgroundColor: `rgba(231 247 67 / 40%)`,
    },
})) as typeof TableRow;
