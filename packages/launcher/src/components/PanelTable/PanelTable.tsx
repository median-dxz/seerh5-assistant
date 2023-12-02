import type { TableCellProps, TableProps } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

import { useCachedReturn } from '@/utils/hooks/useCachedReturn';
import { RowDataContext, RowIndexContext } from './usePanelTableData';

export type PanelColumns = Array<{ field: string; columnName: string } & TableCellProps>;

type PanelTableProps<TData> = {
    data: TData[];
    toRowKey?: (data: TData) => React.Key;
    columns: PanelColumns;
    rowElement: React.ReactNode;
} & Omit<TableProps, 'children'>;

export const ColumnContext = React.createContext<PanelColumns>([]);

export function PanelTable<TData>(props: PanelTableProps<TData>) {
    const { toRowKey, data, columns, rowElement, ...tableProps } = props;

    const keyRef = useCachedReturn(data, toRowKey, (r, data) => r ?? JSON.stringify(data));
    const dataRef = useCachedReturn(data, undefined, (r, data, index) => {
        return { data, index };
    });

    return (
        <Table size="small" {...tableProps}>
            <TableHead>
                <TableRow>
                    {columns.map(({ columnName: name, ...rest }, index) => (
                        <TableCell key={index} align="center" {...rest}>
                            {name}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                <ColumnContext.Provider value={columns}>
                    {data.map((data, index) => {
                        const key = keyRef.current.get(data);
                        let ctx = dataRef.current.get(data)!;
                        if (ctx.index !== index) {
                            ctx = { data, index };
                            dataRef.current.set(data, ctx);
                        }
                        return (
                            <RowIndexContext.Provider key={key} value={index}>
                                <RowDataContext.Provider key={key} value={data}>
                                    {rowElement}
                                </RowDataContext.Provider>
                            </RowIndexContext.Provider>
                        );
                    })}
                </ColumnContext.Provider>
            </TableBody>
        </Table>
    );
}
