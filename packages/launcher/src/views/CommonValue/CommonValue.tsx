import React, { useEffect, useState } from 'react';

import { Item, updateItems } from 'sea-core';

import { Button, Typography } from '@mui/material';

import { LabeledLinearProgress } from '@sea-launcher/components/LabeledProgress';
import { PanelField, PanelTable, useRowData, type PanelColumns } from '@sea-launcher/components/PanelTable';
import { PanelStateContext } from '@sea-launcher/context/PanelState';
import { getItemIcon } from '@sea-launcher/utils/egretRes';

import { SeaTableRow } from '@sea-launcher/components/styled/TableRow';
import { idList, openModuleList } from './data';

const convertUnit = (count: number) => {
    if (count < 1e4) {
        return count.toString();
    } else {
        return (count / 1e4).toFixed(0).toString() + '万';
    }
};

const columns: PanelColumns = [
    { field: 'id', columnName: 'ID' },
    { field: 'icon', columnName: '' },
    { field: 'name', columnName: '名称' },
    { field: 'amount', columnName: '数量' },
    { field: 'exchange', columnName: '兑换' },
];

const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)!).map((obj) => new Item(obj));

export function CommonValue() {
    const [items, setItems] = useState(rows);

    useEffect(() => {
        updateItems(rows.map((r) => r.id)).then(() => {
            rows.forEach((r) => (r.amount = ItemManager.getNumByID(r.id)));
            rows.find((r) => r.name === '赛尔豆')!.amount = MainManager.actorInfo.coins;
            setItems([...rows]);
        });
    }, []);

    return <PanelTable columns={columns} rowElement={<PanelRow />} data={items} toRowKey={(item) => item.id} />;
}

const PanelRow: React.FC = () => {
    const item = useRowData<Item>();
    const panelState = React.useContext(PanelStateContext);

    let amountRender = undefined;
    if (item.amount) {
        amountRender = item.limit ? (
            <LabeledLinearProgress
                progress={item.amount}
                total={item.limit}
                overridePrompt={`${convertUnit(item.amount)}/${convertUnit(item.limit)}`}
            />
        ) : (
            <Typography>{convertUnit(item.amount)}</Typography>
        );
    }

    return (
        <SeaTableRow>
            <PanelField field="id">{item.id}</PanelField>
            <PanelField field="icon">
                <img crossOrigin="anonymous" src={getItemIcon(item.id)} alt={item.name} width={36} />
            </PanelField>
            <PanelField field="name">{item.name}</PanelField>
            <PanelField field="amount">{amountRender}</PanelField>
            <PanelField field="exchange">
                {openModuleList[item.id] ? (
                    <Button
                        onClick={() => {
                            openModuleList[item.id]();
                            panelState.setOpen(false);
                        }}
                    >
                        兑换
                    </Button>
                ) : undefined}
            </PanelField>
        </SeaTableRow>
    );
};
