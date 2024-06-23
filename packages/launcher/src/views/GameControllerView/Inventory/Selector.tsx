import type { SWRSubscriptionOptions } from 'swr/subscription';

import { Box, Grid, Tooltip, Typography } from '@mui/material';
import React, { memo } from 'react';
import useSWRSubscription from 'swr/subscription';

import { SEAEventSource, Subscription } from '@sea/core';

import type { PopupMenuButtonProps } from '@/components/PopupMenuButton';
import { ClampText } from '../styled/ClampText';
import { SelectorButton } from '../styled/SelectorButton';

export interface SelectorProps {
    id: string;
    label: string;
    currentItemGetter: () => number | undefined;
    allItemGetter: () => PopupMenuButtonProps<number, object>['data'];
    nameGetter: (id: number) => string | undefined;
    descriptionGetter: (id: number) => string | undefined;
    dataKey: string;
    eventSource: SEAEventSource<unknown>;
    mutate: (id: number) => unknown;
}

export function Selector({
    id,
    label,
    dataKey,
    currentItemGetter: itemGetter,
    allItemGetter,
    nameGetter,
    eventSource,
    mutate,
    descriptionGetter
}: SelectorProps) {
    const { data } = useSWRSubscription(
        dataKey,
        (_, { next }: SWRSubscriptionOptions<number, Error>) => {
            const sub = new Subscription();
            sub.on(eventSource, () => {
                next(null, itemGetter());
            });
            return () => sub.dispose();
        },
        {
            fallbackData: itemGetter()
        }
    );

    const handleSelectItem = React.useCallback(
        (newItem: number) => {
            if (newItem !== data) {
                mutate(newItem);
            }
        },
        [data, mutate]
    );

    const description = data ? descriptionGetter(data) ?? '无' : '无';

    return (
        <Grid container columnSpacing={3} alignItems="center">
            <Grid item xs={2}>
                <Typography variant="subtitle1" fontSize="1rem">
                    {label}
                </Typography>
            </Grid>
            <Grid item xs={5}>
                <SelectorButton
                    id={id}
                    data={allItemGetter()}
                    onSelectItem={handleSelectItem}
                    menuProps={{
                        RenderItem: ItemName,
                        renderItemProps: { nameGetter }
                    }}
                >
                    {data ? nameGetter(data) ?? '无' : '无'}
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

const ItemName = memo(({ item, nameGetter }: ItemProps) => nameGetter(item) ?? '');
