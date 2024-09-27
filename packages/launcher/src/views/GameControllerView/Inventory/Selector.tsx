import { Box, Grid2, styled, Tooltip, Typography } from '@mui/material';
import NanoClamp from 'nanoclamp';
import { useCallback, useEffect, useState } from 'react';

import type { SEAEventSource } from '@sea/core';

import { PopupMenuButton } from '@/components/PopupMenuButton';

const ClampText = styled(NanoClamp)(({ theme }) => ({
    ...theme.typography.button,
    fontSize: 12,
    margin: 0
}));

export interface SelectorProps {
    id: string;
    label: string;
    getCurrentItem: () => number | undefined;
    fetchAllItems: (() => Promise<number[]>) | (() => number[]);
    getName: (id: number) => string | undefined;
    getDescription: (id: number) => string | undefined;
    eventSource: SEAEventSource<unknown>;
    mutate: (id: number) => unknown;
}

export function Selector({
    id,
    label,
    getCurrentItem,
    fetchAllItems,
    getName,
    eventSource,
    mutate,
    getDescription
}: SelectorProps) {
    const [data, setData] = useState(getCurrentItem);

    useEffect(() => {
        const sub = eventSource.on(() => {
            setData(getCurrentItem());
        });
        return () => void eventSource.off(sub);
    }, [eventSource, getCurrentItem]);

    const handleSelectItem = useCallback(
        (newItem: number) => {
            if (newItem !== data) {
                mutate(newItem);
            }
        },
        [data, mutate]
    );

    const description = data ? (getDescription(data) ?? '无') : '无';

    return (
        <Grid2 container columnSpacing={3} alignItems="center">
            <Grid2 size={2}>
                <Typography variant="h2" fontSize="1rem">
                    {label}
                </Typography>
            </Grid2>
            <Grid2 size={5}>
                <PopupMenuButton
                    buttonProps={{
                        sx: { width: '100%', padding: '6px 12px', justifyContent: 'start' }
                    }}
                    id={id}
                    data={() => Promise.resolve(fetchAllItems())}
                    onSelectItem={handleSelectItem}
                    renderItem={({ item }) => getName(item) ?? '未知'}
                >
                    <Box
                        sx={{
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'center'
                        }}
                    >
                        {(data && getName(data)) ?? '无'}
                    </Box>
                </PopupMenuButton>
            </Grid2>
            <Grid2 size={5}>
                <Tooltip title={description}>
                    <Box>
                        <ClampText accessibility={false} is="p" lines={2} debounce={150} text={description} />
                    </Box>
                </Tooltip>
            </Grid2>
        </Grid2>
    );
}
