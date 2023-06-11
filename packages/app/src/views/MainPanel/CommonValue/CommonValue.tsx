import React, { useEffect, useState } from 'react';

import { Item, updateItems } from 'sa-core';

import { Button, Typography } from '@mui/material';

import { PanelColumnRender, PanelColumns, PanelTable } from '@sa-app/components/PanelTable';
import { PercentLinearProgress } from '@sa-app/components/PercentLinearProgress';
import { PanelStateContext } from '@sa-app/context/PanelState';
import { getItemIcon } from '@sa-app/utils/egretRes';

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

export function CommonValue() {
    const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)!).map((obj) => new Item(obj));
    const panelState = React.useContext(PanelStateContext);
    const [items, setItems] = useState(rows);

    useEffect(() => {
        updateItems(rows.map((r) => r.id)).then(() => {
            rows.forEach((r) => (r.amount = ItemManager.getNumByID(r.id)));
            rows.find((r) => r.name === '赛尔豆')!.amount = MainManager.actorInfo.coins;
            setItems([...rows]);
        });
    });

    const renderColumn: PanelColumnRender<Item> = React.useCallback(
        (item) => ({
            id: item.id,
            icon: <img crossOrigin="anonymous" src={getItemIcon(item.id)} alt={item.name} width={48} />,
            name: item.name,
            amount: item.limit ? (
                <PercentLinearProgress
                    progress={item.amount}
                    total={item.limit}
                    cover={`${convertUnit(item.amount)}/${convertUnit(item.limit)}`}
                />
            ) : (
                <Typography>{convertUnit(item.amount)}</Typography>
            ),
            exchange: openModuleList[item.id] ? (
                <Button
                    onClick={() => {
                        openModuleList[item.id]();
                        panelState.setOpen(false);
                    }}
                >
                    兑换
                </Button>
            ) : undefined,
        }),
        [panelState]
    );

    return <PanelTable columns={columns} columnRender={renderColumn} data={items} toRowKey={(item) => item.id} />;
}
