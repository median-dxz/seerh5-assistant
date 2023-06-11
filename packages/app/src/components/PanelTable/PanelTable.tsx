import { Table, TableBody, TableCell, TableHead, TableProps, TableRow, TableRowProps } from '@mui/material';
import React from 'react';
import { SaTableRow } from '../styled/TableRow';
import { PanelFieldProps } from './PanelField';
import { PanelRow } from './PanelRow';

export type PanelColumnRender<TDataType> = (data: TDataType, index: number) => Record<string, React.ReactNode | string>;
export type PanelColumns = Array<PanelFieldProps>;

type PanelTableProps<TDataType> = {
    data: TDataType[];
    toRowKey?: (data: TDataType) => React.Key;
    columns: PanelColumns;
    columnRender: PanelColumnRender<TDataType>;
    rowProps?: (data: TDataType, index: number) => TableRowProps;
} & Omit<TableProps, 'children'>;

export function PanelTable<TDataType>(props: PanelTableProps<TDataType>) {
    const { toRowKey, data, columns, columnRender, rowProps, ...tableProps } = props;

    return (
        <Table size="small" {...tableProps}>
            <TableHead>
                <TableRow>
                    {columns.map(({ columnName: name, ...rest }) => (
                        <TableCell align="center" {...rest}>
                            {name}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, index) => {
                    const rowKey = toRowKey?.(row) ?? undefined;
                    return (
                        <SaTableRow key={rowKey} {...rowProps?.(row, index)}>
                            <PanelRow columns={columns} renderData={columnRender(row, index)} />
                        </SaTableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
