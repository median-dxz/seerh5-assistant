import type { TableCellProps, TableProps } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableRow, alpha } from '@mui/material';
import * as React from 'react';

import { useListDerivedValue } from '@/shared';
import { useCallback } from 'react';

export type PanelColumn = { field: string; columnName: string } & TableCellProps;

type PanelTableProps<Data> = {
    data: Data[];
    toRowKey?: (data: Data) => React.Key;
    columns: PanelColumn[];
    renderRow: (data: Data, index: number) => React.ReactElement;
} & Omit<TableProps, 'children'>;

export const ColumnContext = React.createContext<PanelColumn[]>([]);

export function PanelTable<TData>(props: PanelTableProps<TData>) {
    const { toRowKey, data, columns, renderRow, ...tableProps } = props;
    const makeRowKey = useCallback((data: TData) => toRowKey?.(data) ?? JSON.stringify(data), [toRowKey]);
    const keyRef = useListDerivedValue(data, makeRowKey);
    const renderResultRef = useListDerivedValue(data, renderRow);

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
                    {data.map((data) => {
                        const key = keyRef.current.get(data);
                        return <React.Fragment key={key}>{renderResultRef.current.get(data)}</React.Fragment>;
                    })}
                </ColumnContext.Provider>
            </TableBody>
        </Table>
    );
}
