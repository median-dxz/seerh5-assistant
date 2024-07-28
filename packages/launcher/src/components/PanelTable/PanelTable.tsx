import type { TableCellProps, TableProps } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableRow, alpha } from '@mui/material';
import * as React from 'react';

import { useListDerivedValue } from '@/shared';
import { useCallback } from 'react';
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

    const makeRowKey = useCallback((data: TData) => toRowKey?.(data) ?? JSON.stringify(data), [toRowKey]);
    const makeRowEntities = useCallback((data: TData, index: number) => ({ data, index }), []);

    const keyRef = useListDerivedValue(data, makeRowKey);
    const dataRef = useListDerivedValue(data, makeRowEntities);

    return (
        <Table size="small" {...tableProps}>
            <TableHead>
                <TableRow sx={{ th: { borderBottom: `1px solid ${alpha('rgb(129, 212, 250)', 0.16)}` } }}>
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
