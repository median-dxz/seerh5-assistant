import type { TableCellProps } from '@mui/material';
import { TableCell } from '@mui/material';
import { useContext, useMemo } from 'react';
import { ColumnContext } from './PanelTable';

export function PanelField({ children, field, ...rest }: TableCellProps & { field: string }) {
    const columns = useContext(ColumnContext);
    const columnProps = useMemo(() => columns.find((c) => c.field === field), [columns, field]);
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
