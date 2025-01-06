import type { TableCellProps } from '@mui/material';
import { TableCell } from '@mui/material';
import { useContext } from 'react';
import { ColumnContext } from './context';

export function PanelField({ children, field, ...rest }: TableCellProps & { field: string }) {
    const columns = useContext(ColumnContext);
    const columnProps = columns.find((c) => c.field === field);
    if (columnProps) {
        const { columnName: _, field: _1, ...cellProps } = columnProps;
        return (
            <TableCell align="center" {...cellProps} {...rest}>
                {children}
            </TableCell>
        );
    } else {
        <TableCell align="center" {...rest}>
            {children}
        </TableCell>;
    }
}
