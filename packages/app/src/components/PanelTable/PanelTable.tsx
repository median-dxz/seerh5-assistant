import type { TableCellProps, TableProps, TableRowProps } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { SaTableRow } from '../styled/TableRow';

import { useCachedReturn } from '@sa-app/utils/hooks/useCachedReturn';
import { PanelFields } from './PanelRow';

export type PanelColumnRender<TDataType> = (data: TDataType, index: number) => Record<string, React.ReactNode | string>;
export type PanelColumns = Array<{ field: string; columnName: string } & TableCellProps>;

type PanelTableProps<TDataType> = {
    data: TDataType[];
    toRowKey?: (data: TDataType) => React.Key;
    columns: PanelColumns;
    columnRender: PanelColumnRender<TDataType>;
    rowProps?: (data: TDataType, index: number) => TableRowProps;
} & Omit<TableProps, 'children'>;

const MemoizedRow = React.memo(SaTableRow);

export function PanelTable<TDataType>(props: PanelTableProps<TDataType>) {
    const { toRowKey, data, columns, columnRender, rowProps, ...tableProps } = props;

    const keyRef = useCachedReturn(data, toRowKey, (r, data) => r ?? JSON.stringify(data));
    const renderDataRef = useCachedReturn(data, columnRender, (r) => <PanelFields columns={columns} render={r!} />);
    const rowPropsRef = useCachedReturn(data, rowProps, (r) => r);

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
                {data.map((data) => {
                    const key = keyRef.current.get(data);
                    const props = rowPropsRef.current.get(data);
                    const renderedRow = renderDataRef.current.get(data)!;
                    return (
                        <MemoizedRow key={key} {...props}>
                            {renderedRow}
                        </MemoizedRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
