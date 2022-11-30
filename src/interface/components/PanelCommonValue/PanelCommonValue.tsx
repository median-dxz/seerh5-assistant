import { Button, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import * as React from 'react';
import { useLayoutEffect, useState } from 'react';

import Item from '@sa-core/entities/item';
import { idList, openModuleList } from './data';

const unitConvert = (count: number): string => {
    if (count < 1e4) {
        return count.toString();
    } else {
        return (count / 1e4).toFixed(0).toString() + '万';
    }
};

let icons: any = null;

export function PanelCommonValue() {
    const rows = idList.map((key) => ItemXMLInfo.getItemObj(key)).map((obj) => new Item(obj));
    let [imgEl, setImgEl] = useState(icons ?? []);
    let [initIcon, completeInitIcon] = useState(false);

    useLayoutEffect(() => {
        if (initIcon === false && icons == null) {
            let promises = rows.map((row) =>
                RES.getResByUrl(ClientConfig.getItemIcon(row.id)).then((r: any) => r.bitmapData.source)
            );
            Promise.all(promises).then((r) => {
                setImgEl(r);
                icons = r;
                completeInitIcon(true);
            });
        }
    });

    return (
        <Table aria-label="common value table">
            <TableHead>
                <TableRow>
                    <TableCell align="center">物品ID</TableCell>
                    <TableCell align="center">图标</TableCell>
                    <TableCell align="center">名称</TableCell>
                    <TableCell align="center">数量</TableCell>
                    <TableCell align="center">兑换页面</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" align="center">
                            {row.id}
                        </TableCell>
                        <TableCell align="center">
                            <img src={imgEl[index]?.src} width={48} />
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">
                            {row.limit ? (
                                <Typography>
                                    {unitConvert(row.amount)}/{unitConvert(row.limit)}
                                    <LinearProgress
                                        color="inherit"
                                        variant="determinate"
                                        value={(row.amount / row.limit) * 100}
                                    />
                                </Typography>
                            ) : (
                                <Typography>{unitConvert(row.amount)}</Typography>
                            )}
                        </TableCell>
                        <TableCell align="center">
                            {openModuleList[row.id] ? (
                                <Button onClick={openModuleList[row.id]}>兑换</Button>
                            ) : undefined}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
