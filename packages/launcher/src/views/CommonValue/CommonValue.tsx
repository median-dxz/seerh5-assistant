import React, { useEffect, useMemo, useState } from 'react';

import { Item } from '@sea/core';

import { Button, Typography } from '@mui/material';

import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import { Icon } from '@/services/resource';

import { SeaTableRow } from '@/components/styled/TableRow';
import { useMainState } from '@/context/useMainState';
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
    { field: 'exchange', columnName: '兑换' }
];

export function CommonValue() {
    const rows = useMemo(() => idList.map((key) => ItemXMLInfo.getItemObj(key)!).map((obj) => new Item(obj)), []);

    const [items, setItems] = useState(rows);

    useEffect(() => {
        ItemManager.updateItems(
            rows.map((r) => r.id),
            () => {
                rows.forEach((r) => (r.amount = ItemManager.getNumByID(r.id)));
                rows.find((r) => r.name === '赛尔豆')!.amount = MainManager.actorInfo.coins;
                setItems([...rows]);
            }
        );
    }, [rows]);

    return <PanelTable columns={columns} rowElement={<PanelRow />} data={items} toRowKey={(item) => item.id} />;
}

const PanelRow: React.FC = () => {
    const item = useRowData<Item>();
    const panelState = useMainState();

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
                <img crossOrigin="anonymous" src={Icon.item(item.id)} alt={item.name} width={36} />
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
