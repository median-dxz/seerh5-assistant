import { PanelTable, type PanelColumns } from '@/components/PanelTable';
import { PopupMenuButton } from '@/components/PopupMenuButton';
import { useMainState } from '@/context/useMainState';
import { useBagPets } from '@/utils/hooks/useBagPets';
import { useConfigPersistence } from '@/utils/useConfigPersistence';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pet, SEAPet } from 'sea-core';
import { Engine } from 'sea-core/engine';
import useSWR from 'swr';
import { Loading } from './Loading';
import { PanelRow } from './PetBagPanelRow';
import { Backpack } from './icons/Backpack';
import { HealthBroken } from './icons/HealthBroken';
import { HpBar } from './icons/HpBar';

type BasePetInfo = Pick<Pet, 'catchTime' | 'id' | 'name'>;

const defaultPetGroups: number[][] = Array(0);

function usePetGroups() {
    const { data, isLoading, mutate } = useConfigPersistence('PetGroups', defaultPetGroups);
    return [data, isLoading, mutate] as const;
}

export function PetBag() {
    const { pets } = useBagPets();

    const [selected, setSelected] = useState<number[]>([]);
    const [petGroups, loading, updatePetGroups] = usePetGroups();

    const { data: petGroupsInfo, isLoading: loadingPetInfo } = useSWR(
        `ds://petGroups/${JSON.stringify(petGroups)}`,
        () => {
            const promises = petGroups.map((group) => Promise.all(group.map(SEAPet).map((pet) => pet.get())));
            return Promise.all(promises);
        }
    );

    useEffect(() => {
        setSelected([]);
    }, [pets]);

    const cols: PanelColumns = useMemo(
        () => [
            { columnName: '', field: 'select' },
            { columnName: '精灵', field: 'name' },
            { columnName: '血量', field: 'hp' },
            { columnName: '操作', field: 'action' },
        ],
        []
    );

    const toRowKey = useCallback((pet: Pet) => pet.catchTime, []);

    const { setOpen } = useMainState();
    const openPetBag = useCallback(() => {
        ModuleManager.showModule('petBag');
        setOpen(false);
    }, [setOpen]);

    if (!pets || loadingPetInfo || loading) return <Loading />;

    const handleLowerHp = () => {
        Engine.lowerHp(selected);
    };

    const handleCurePets = () => {
        if (selected.length === pets.length || selected.length === 0) {
            Engine.cureAllPet();
        } else {
            for (const cureCt of selected) {
                SEAPet(cureCt).cure();
            }
        }
    };

    const pattern = (group: BasePetInfo[], index: number) => {
        return `方案${index}: ${group.map((pet) => pet.name).join(', ')}`;
    };

    const editPattern = (group: BasePetInfo[], index: number) => {
        return `方案${index}: ${group.map((pet) => pet.name).join(', ')}`;
    };

    const handleSavePattern = (_: BasePetInfo[], index: number) => {
        updatePetGroups((draft) => {
            draft[index] = pets.map((pet) => pet.catchTime);
            return draft;
        });
    };

    const handleSwitchBag = (group: BasePetInfo[]) => {
        Engine.switchBag(group.map((pet) => pet.catchTime));
    };

    return (
        <Stack width={'100%'} alignItems="center">
            <Stack flexDirection="row" width={'100%'} justifyContent="space-between">
                <Stack
                    sx={{
                        flexDirection: 'row',
                        '& > *:not(:first-child)': {
                            ml: 1,
                        },
                    }}
                >
                    <Button startIcon={<HpBar />} onClick={handleLowerHp}>
                        压血
                    </Button>
                    <Button startIcon={<HealthBroken />} onClick={handleCurePets}>
                        治疗
                    </Button>
                    <Button startIcon={<Backpack />} onClick={openPetBag}>
                        背包
                    </Button>
                </Stack>
                <Stack
                    sx={{
                        flexDirection: 'row',
                        '& > *:not(:first-child)': {
                            ml: 1,
                        },
                    }}
                >
                    <PopupMenuButton data={petGroupsInfo} renderItem={pattern} onSelectItem={handleSavePattern}>
                        {loading ? <CircularProgress size={16} /> : '保存方案'}
                    </PopupMenuButton>
                    <PopupMenuButton
                        data={petGroupsInfo}
                        renderItem={editPattern}
                        onSelectItem={handleSwitchBag}
                    >
                        {loading ? <CircularProgress size={16} /> : '更换方案'}
                    </PopupMenuButton>
                </Stack>
            </Stack>
            <Box
                sx={{
                    overflowX: 'scroll',
                    width: '100%',
                }}
            >
                <PanelTable
                    sx={{
                        maxWidth: '100%',
                        minWidth: 'max-content',
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
