import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import * as React from 'react';

export function PanelPackageCapture() {
    return (
        <Table aria-label="common value table">
            <TableHead>
                <TableRow>
                    <TableCell align="center">时间</TableCell>
                    <TableCell align="center">序号</TableCell>
                    <TableCell align="center">方向</TableCell>
                    <TableCell align="center">命令ID</TableCell>
                    <TableCell align="center">名称</TableCell>
                    <TableCell align="center">长度</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow key={1} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
