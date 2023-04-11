import { Button, TableCell, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { PanelStateContext } from '@sa-app/context/PanelState';
import { SAEngine, SAEntity } from 'seerh5-assistant-core';
import { PanelTableBase, PanelTableBodyRow, PercentLinearProgress } from '../base';
import { idList, openModuleList } from './data';

const unitConvert = (count: number): string => {
    if (count < 1e4) {
        return count.toString();
    } else {
        return (count / 1e4).toFixed(0).toString() + '万';
    }
};

let icons: string[] | null = null;

export function CommonValue() {
    const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)!).map((obj) => new SAEntity.Item(obj));

    let [items, setItems] = useState(rows);
    let [imgEl, setImgEl] = useState(icons ?? []);
    let [initIcon, completeInitIcon] = useState(false);

    useEffect(() => {
        if (initIcon === false && icons == null) {
            let promises = rows.map((row) =>
                RES.getResByUrl(ClientConfig.getItemIcon(row.id))
                    .then((r) => r.bitmapData.source)
                    .then((r) => {
                        if (r) {
                            return r.src;
                        } else {
                            return sac.ResourceCache.get(ClientConfig.getItemIcon(row.id));
                        }
                    })
                    .catch((reason) => {
                        console.error(reason);
                    })
            );
            Promise.all(promises).then((r) => {
                // console.log(r);
                setImgEl(r);
                icons = r;
                completeInitIcon(true);
            });
        }

        new Promise<void>((resolve) => {
            ItemManager.updateItems(
                rows.map((r) => r.id),
                resolve
            );
        }).then(() => {
            rows.forEach((r) => (r.amount = SAEngine.getItemNum(r.id)));
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
            {items.map((row, index) => (
                <PanelStateContext.Consumer>
                    {(panelState) => (
                        <PanelTableBodyRow key={row.id}>
                            <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell>
                            <TableCell>
                                <img crossOrigin="anonymous" src={imgEl[index]} width={48} />
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>
                                {row.limit ? (
                                    <PercentLinearProgress
                                        progress={row.amount}
                                        total={row.limit}
                                        cover={`${unitConvert(row.amount)}/${unitConvert(row.limit)}`}
                                    />
                                ) : (
                                    <Typography>{unitConvert(row.amount)}</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {openModuleList[row.id] ? (
                                    <Button
                                        onClick={() => {
                                            openModuleList[row.id]();
                                            panelState.setOpen(false);
                                        }}
                                    >
                                        兑换
                                    </Button>
                                ) : undefined}
                            </TableCell>
                        </PanelTableBodyRow>
                    )}
                </PanelStateContext.Consumer>
            ))}
        </PanelTableBase>
    );
}
