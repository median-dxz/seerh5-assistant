import { Button, TableCell, Typography, type TableRowProps } from '@mui/material';
import { PanelStateContext } from '@sa-app/context/PanelState';

import React from 'react';
import { type Item } from 'sa-core';

import { PanelTableBodyRow } from '@sa-app/components/PanelTableBodyRow';
import { PercentLinearProgress } from '@sa-app/components/PercentLinearProgress';
import { useEgretImageRes } from '@sa-app/utils/hooks/useEgretRes';
import { openModuleList } from './data';

const unitConvert = (count: number): string => {
    if (count < 1e4) {
        return count.toString();
    } else {
        return (count / 1e4).toFixed(0).toString() + '万';
    }
};

type Props = {
    item: Item;
} & TableRowProps;

export function ItemListRow({ item, ...props }: Props) {
    const { src: icon } = useEgretImageRes(ClientConfig.getItemIcon(item.id));
    const panelState = React.useContext(PanelStateContext);

    return (
        <PanelTableBodyRow {...props}>
            <TableCell component="th" scope="row">
                {item.id}
            </TableCell>
            <TableCell>
                <img crossOrigin="anonymous" src={icon} width={48} />
            </TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>
                {item.limit ? (
                    <PercentLinearProgress
                        progress={item.amount}
                        total={item.limit}
                        cover={`${unitConvert(item.amount)}/${unitConvert(item.limit)}`}
                    />
                ) : (
                    <Typography>{unitConvert(item.amount)}</Typography>
                )}
            </TableCell>
            <TableCell>
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
            </TableCell>
        </PanelTableBodyRow>
    );
}
