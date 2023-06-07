import {
    Table,
    TableBody,
    TableHead,
    TableProps,
    TableRow
} from '@mui/material';
import React, { PropsWithChildren } from 'react';


export function PanelTableBase(props: PropsWithChildren<{ heads: React.ReactNode; } & TableProps>) {
    const { heads: title, children, ...tableProps } = props;
    return (
        <Table {...tableProps}>
            <TableHead>
                <TableRow>{title}</TableRow>
            </TableHead>
            <TableBody>{children}</TableBody>
        </Table>
    );
}
