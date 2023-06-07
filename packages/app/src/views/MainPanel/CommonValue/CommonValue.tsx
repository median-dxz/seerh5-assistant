import { TableCell } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Item, updateItems } from 'sa-core';
import { PanelTableBase } from '../../../components/PanelTableBase';
import { ItemListRow } from './ItemListRow';
import { idList } from './data';

export function CommonValue() {
    const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)!).map((obj) => new Item(obj));

    const [items, setItems] = useState(rows);

    useEffect(() => {
        updateItems(rows.map((r) => r.id)).then(() => {
            rows.forEach((r) => (r.amount = ItemManager.getNumByID(r.id)));
            rows.find((r) => r.name === '赛尔豆')!.amount = MainManager.actorInfo.coins;
            setItems([...rows]);
        });
    }, [rows]);

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
