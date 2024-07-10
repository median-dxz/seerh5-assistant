import { Loading } from '@/components/Loading';
import { PanelTable, type PanelColumns } from '@/components/PanelTable';
import { useBagPets } from '@/services/useBagPets';
import { Box, Stack } from '@mui/material';
import type { Pet } from '@sea/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PanelRow } from './PanelRow';
import { ToolBar } from './ToolBar';

export function PetBag() {
    const { pets } = useBagPets();
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        setSelected([]);
    }, [pets]);

    const cols: PanelColumns = useMemo(
        () => [
            { columnName: '', field: 'select' },
            { columnName: '精灵', field: 'name' },
            { columnName: '血量', field: 'hp' },
            { columnName: '操作', field: 'action' }
        ],
        []
    );

    const toRowKey = useCallback((pet: Pet) => pet.catchTime, []);

    if (!pets) return <Loading />;

    return (
        <Stack width={'100%'}>
            <ToolBar selected={selected} />
            <Box
                sx={{
                    overflowX: 'scroll',
                    width: '100%'
                }}
            >
                <PanelTable
                    sx={{
                        maxWidth: '100%',
                        minWidth: 'max-content'
                    }}
                    columns={cols}
                    rowElement={<PanelRow selected={selected} setSelected={setSelected} />}
                    data={pets}
                    toRowKey={toRowKey}
                />
            </Box>
        </Stack>
    );
}
