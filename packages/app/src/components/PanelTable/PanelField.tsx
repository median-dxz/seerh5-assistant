import type { TableCellProps } from '@mui/material';
import { TableCell } from '@mui/material';
import React from 'react';

export type PanelFieldProps = {
    field: string;
    columnName: string;
} & TableCellProps;

export function PanelField({ children, ...rest }: PanelFieldProps) {
    return (
        <TableCell align="center" {...rest}>
            {children}
        </TableCell>
    );
}
