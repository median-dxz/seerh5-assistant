import type { TableCellProps } from '@mui/material';
import { TableCell } from '@mui/material';
import React from 'react';

export function PanelField({ children, ...rest }: TableCellProps) {
    return (
        <TableCell align="center" {...rest}>
            {children}
        </TableCell>
    );
}
