import { Box, Stack } from '@mui/material';
import { engine, spet, type Pet } from '@sea/core';
import { produce } from 'immer';
import { useEffect, useMemo, useState } from 'react';

import { LinerLoading } from '@/components/LinerLoading';
import { PanelTable, type PanelColumn } from '@/components/SEAPanelTable';

import { gameApi } from '@/services/game';

import { PanelRow } from './PanelRow';
import { ToolBar } from './ToolBar';

const toRowKey = (pet: Pet) => pet.catchTime;

export function PetBag() {
    const { data: pets, isFetching } = gameApi.useBagPetsQuery();
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        isFetching && setSelected([]);
    }, [isFetching]);

    const cols: PanelColumn[] = useMemo(
        () => [
            { columnName: '', field: 'select' },
            { columnName: '精灵', field: 'name' },
            { columnName: '血量', field: 'hp' },
            { columnName: '操作', field: 'action' }
        ],
        []
    );

    const handleSelected = (pet: Pet) => (selected: boolean) => {
        setSelected(
            produce((draft) => {
                const r = draft.indexOf(pet.catchTime);
                if (r !== -1 && !selected) {
                    draft.splice(r, 1);
                } else if (r === -1 && selected) {
                    draft.push(pet.catchTime);
                }
            })
        );
    };

    const handleLowerHp = () => {
        setSelected([]);
        void engine.lowerHp(selected);
    };

    const handleCurePets = () => {
        setSelected([]);
        if (selected.length === 0) {
            void engine.cureAllPet();
        } else {
            for (const ct of selected) {
                // if() {
                spet(ct).cure();
                // }
            }
        }
    };

    if (!pets) return <LinerLoading />;

    return (
        <Stack spacing={2}>
            <ToolBar onLowerHp={handleLowerHp} onCurePets={handleCurePets} />
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
                    renderRow={(data, index) => (
                        <PanelRow
                            index={index}
                            pet={data}
                            selected={selected.includes(data.catchTime)}
                            onSelect={handleSelected(data)}
                            isFetching={isFetching}
                        />
                    )}
                    data={pets[0]}
                    toRowKey={toRowKey}
                />
            </Box>
        </Stack>
    );
}
