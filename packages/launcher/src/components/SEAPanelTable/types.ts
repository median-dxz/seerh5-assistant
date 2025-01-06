import type { TableCellProps, TableProps } from '@mui/material';
import type * as React from 'react';

export type PanelColumn = { field: string; columnName: string } & TableCellProps;
export type PanelTableProps<Data> = {
    data: Data[];
    toRowKey?: (data: Data) => React.Key;
    columns: PanelColumn[];
    renderRow: (data: Data, index: number) => React.ReactNode;
} & Omit<TableProps, 'children'>;
