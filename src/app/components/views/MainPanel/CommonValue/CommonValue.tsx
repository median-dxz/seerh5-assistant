import { Button, TableCell, Typography } from '@mui/material';
import * as React from 'react';
import { useLayoutEffect, useState } from 'react';

import { PanelState } from '@sa-app/context/PanelState';
import Item from '@sa-core/entities/item';
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

interface Props {
    panelState: PanelState;
}

export function CommonValue(props: Props) {
    const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)).map((obj) => new Item(obj));
    const { panelState } = props;
    let [imgEl, setImgEl] = useState(icons ?? []);
    let [initIcon, completeInitIcon] = useState(false);

    useLayoutEffect(() => {
        if (initIcon === false && icons == null) {
            let promises = rows.map((row) =>
                RES.getResByUrl(ClientConfig.getItemIcon(row.id))
                    .then((r) => r.bitmapData.source)
                    .then((r) => {
                        if (r) {
                            return r.src;
                        } else {
                            return window.SAResourceMap.get(ClientConfig.getItemIcon(row.id));
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
    });

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
            {rows.map((row, index) => (
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
            ))}
        </PanelTableBase>
    );
}
