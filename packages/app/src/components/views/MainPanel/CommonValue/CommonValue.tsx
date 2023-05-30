import { TableCell } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { getItemNum, Item } from 'sa-core';
import { PanelTableBase } from '../base';
import { idList } from './data';
import { ItemListRow } from './ItemListRow';

export function CommonValue() {
    const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)!).map((obj) => new Item(obj));

    let [items, setItems] = useState(rows);

    useEffect(() => {
        new Promise<void>((resolve) => {
            ItemManager.updateItems(
                rows.map((r) => r.id),
                resolve
            );
        }).then(() => {
            rows.forEach((r) => (r.amount = getItemNum(r.id)));
            rows.find((r) => r.name === '赛尔豆')!.amount = MainManager.actorInfo.coins;
            setItems([...rows]);
        });
    }, []);

    return (
        <PanelTableBase
            size="small"
            aria-label="values table"
            heads={
                <>
                    <TableCell>物品ID</TableCell>
                    <TableCell>图标</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell>数量</TableCell>
                    <TableCell>兑换页面</TableCell>
                </>
            }
        >
            {items.map((row) => (
                <ItemListRow key={row.id} item={row} />
            ))}
        </PanelTableBase>
    );
}
