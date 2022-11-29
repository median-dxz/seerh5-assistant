import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import * as React from 'react';

import Item from '@sa-core/entities/item';
import { idList } from './data';

export function PanelCommonValue() {
    return (
        <Table aria-label="common value table">
            <TableHead>
                <TableRow>
                    <TableCell>物品ID</TableCell>
                    <TableCell>图标</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell>数量</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {idList
                    .map((key) => ItemXMLInfo.getItemObj(key))
                    .map((obj) => new Item(obj))
                    .map((row) => (
                        <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell>
                            <TableCell>
                                <img src={ClientConfig.getItemIcon(row.id)} width={48}></img>
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{`${row.amount}/${row.limit ?? window.Infinity}`}</TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    );
}
