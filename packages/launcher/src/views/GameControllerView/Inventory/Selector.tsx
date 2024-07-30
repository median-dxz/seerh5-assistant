import { Box, Grid, styled, Tooltip, Typography } from '@mui/material';
import NanoClamp from 'nanoclamp';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { SEAEventSource } from '@sea/core';

import { SelectorButton } from './SelectorButton';

const ClampText = styled(NanoClamp)(({ theme }) => ({
    ...theme.typography.button,
    fontSize: 12,
    margin: 0
}));

export interface SelectorProps {
    id: string;
    label: string;
    currentItemGetter: () => number | undefined;
    allItemGetter: () => Promise<number[]>;
    nameGetter: (id: number) => string | undefined;
    descriptionGetter: (id: number) => string | undefined;
    eventSource: SEAEventSource<unknown>;
    mutate: (id: number) => unknown;
}

export function Selector({
    id,
    label,
    currentItemGetter: itemGetter,
    allItemGetter,
    nameGetter,
    eventSource,
    mutate,
    descriptionGetter
}: SelectorProps) {
    const [data, setData] = useState(itemGetter);

    useEffect(() => {
        const sub = eventSource.on(() => {
            setData(itemGetter());
        });
        return () => void eventSource.off(sub);
    }, [eventSource, itemGetter]);

    const handleSelectItem = useCallback(
        (newItem: number) => {
            if (newItem !== data) {
                mutate(newItem);
            }
        },
        [data, mutate]
    );

    const description = data ? (descriptionGetter(data) ?? '无') : '无';

    return (
        <Grid container columnSpacing={3} alignItems="center">
            <Grid item xs={2}>
                <Typography variant="h2" fontSize="1rem">
                    {label}
                </Typography>
            </Grid>
            <Grid item xs={5}>
                <SelectorButton
                    id={id}
                    data={allItemGetter}
                    onSelectItem={handleSelectItem}
                    menuProps={{
                        RenderItem: ItemName,
                        renderItemProps: { nameGetter }
                    }}
                >
                    {data ? (nameGetter(data) ?? '无') : '无'}
                </SelectorButton>
            </Grid>
            <Grid item xs={5}>
                <Tooltip title={description}>
                    <Box>
                        <ClampText accessibility={false} is="p" lines={2} debounce={150} text={description} />
                    </Box>
                </Tooltip>
            </Grid>
        </Grid>
    );
}

interface ItemProps {
    item: number;
    nameGetter: (id: number) => string | undefined;
}

const ItemName = React.memo(function ItemName({ item, nameGetter }: ItemProps) {
    return nameGetter(item) ?? '';
});
