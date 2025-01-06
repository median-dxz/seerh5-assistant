import { Table, TableBody, TableCell, TableHead, TableRow, alpha } from '@mui/material';
import { Fragment, useCallback } from 'react';

import { useListDerivedValue } from '@/shared';
import { ColumnContext } from './context';
import type { PanelTableProps } from './types';

export type { PanelColumn, PanelTableProps } from './types';

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
                        return <Fragment key={key}>{renderResultRef.current.get(data)}</Fragment>;
                    })}
                </ColumnContext.Provider>
            </TableBody>
        </Table>
    );
}
