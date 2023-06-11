import React from 'react';
import { PanelField } from './PanelField';
import { PanelColumns } from './PanelTable';

interface PanelRowProps {
    columns: PanelColumns;
    renderData: Record<string, React.ReactNode | string>;
}

export function PanelRow({ columns, renderData }: PanelRowProps) {
    return columns.map(({ field: key, columnName: _, ...rest }) => (
        <PanelField key={key} {...rest}>
            {renderData[key]}
        </PanelField>
    ));
}
