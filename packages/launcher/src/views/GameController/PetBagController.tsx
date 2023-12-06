import { Box, Button, ButtonGroup, Checkbox, CircularProgress, LinearProgress, Typography } from '@mui/material';

import { useConfigPersistence } from '@/utils/useConfigPersistence';
import React from 'react';
import { Pet, SEAPet, delay } from 'sea-core';
import { Engine } from 'sea-core/engine';

import { Icon } from '@/service/resource';
import { useBagPets } from '@/utils/hooks/useBagPets';

import { PanelField, PanelTable, useIndex, useRowData, type PanelColumns } from '@/components/PanelTable';
import { PopupMenuButton } from '@/components/PopupMenuButton';
import { SeaTableRow } from '@/components/styled/TableRow';
import useSWR from 'swr';

type BasePetInfo = Pick<Pet, 'catchTime' | 'id' | 'name'>;

const defaultPetGroups: number[][] = Array(6).fill((() => [])());

function usePetGroups() {
    const { data, isLoading, mutate } = useConfigPersistence('PetGroups', defaultPetGroups);
    return [data, isLoading, mutate] as const;
}

export function PetBagController() {
    const { pets } = useBagPets();

    const [selected, setSelected] = React.useState<number[]>([]);
    const [petGroups, loading, updatePetGroups] = usePetGroups();

    const { data: petGroupsInfo, isLoading: loadingPetInfo } = useSWR(
        `ds://petGroups/${JSON.stringify(petGroups)}`,
        () => {
            const promises = petGroups.map((group) => Promise.all(group.map(SEAPet).map((pet) => pet.get())));
            return Promise.all(promises);
        }
    );

    React.useEffect(() => {
        setSelected([]);
    }, [pets]);

    const cols: PanelColumns = React.useMemo(
        () => [
            { columnName: '', field: 'select' },
            { columnName: 'id', field: 'id' },
            { columnName: '', field: 'icon' },
            { columnName: '名称', field: 'name' },
            { columnName: '血量', field: 'hp' },
            { columnName: '操作', field: 'action' },
        ],
        []
    );

    const toRowKey = React.useCallback((pet: Pet) => pet.catchTime, []);

    if (!pets || loadingPetInfo || loading) return <LinearProgress />;

    const handleLowerHp = () => {
        Engine.lowerHp(selected);
    };

    const handleCurePets = () => {
        for (const cureCt of selected) {
            SEAPet(cureCt).cure();
        }
    };

    const handleCopyCatchTime = () => {
        navigator.clipboard.writeText(
            JSON.stringify(pets.map((pet) => ({ name: pet.name, catchTime: pet.catchTime })))
        );
        BubblerManager.getInstance().showText('复制成功');
    };

    const pattern = (group: BasePetInfo[], index: number) => {
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
        <>
            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                精灵背包
            </Typography>
            <Button onClick={handleLowerHp}>压血</Button>
            <Button onClick={handleCurePets}>治疗</Button>
            <Button onClick={handleCopyCatchTime}>复制catchTime</Button>

            <PopupMenuButton data={petGroupsInfo} renderItem={pattern} onSelectItem={handleSwitchBag}>
                {loading ? <CircularProgress size={16} /> : '更换方案'}
            </PopupMenuButton>

            <PopupMenuButton data={petGroupsInfo} renderItem={pattern} onSelectItem={handleSavePattern}>
                {loading ? <CircularProgress size={16} /> : '保存方案'}
            </PopupMenuButton>

            <Box
                sx={{
                    m: -1,
                    overflowX: 'scroll',
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
        </>
    );
}

interface PanelRowProps {
    selected: number[];
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

function PanelRow({ selected, setSelected }: PanelRowProps) {
    const pet = useRowData<Pet>();
    const index = useIndex();

    const handleOpenPetItemUseProp = React.useCallback(async (ct: number) => {
        await ModuleManager.showModule('petBag');
        const petBagModule = Engine.inferCurrentModule<petBag.PetBag>();
        await delay(300);
        const petBagPanel = petBagModule.currentPanel!;
        petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
        await delay(300);
        petBagPanel.showDevelopBaseView();
        petBagPanel.showDevelopView(9);
    }, []);

    return (
        <SeaTableRow
            onClick={() => {
                setSelected((selected) => {
                    if (selected.includes(pet.catchTime)) {
                        return selected.filter((ct) => ct !== pet.catchTime);
                    } else {
                        return [...selected, pet.catchTime];
                    }
                });
            }}
        >
            <PanelField field="select">
                <Checkbox checked={selected.includes(pet.catchTime)} />
            </PanelField>
            <PanelField field="id" sx={{ userSelect: 'none', cursor: 'pointer' }}>
                {pet.id}
            </PanelField>
            <PanelField field="icon" sx={{ userSelect: 'none' }}>
                <img crossOrigin="anonymous" src={Icon.petHead(pet.id)} alt={pet.name} width={48} />
            </PanelField>
            <PanelField field="name">{pet.name}</PanelField>
            <PanelField field="hp">{`${pet.baseCurHp}/${pet.baseMaxHp}`}</PanelField>
            <PanelField field="action">
                <ButtonGroup>
                    {index !== 0 && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                SEAPet(pet).default();
                            }}
                        >
                            首发
                        </Button>
                    )}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            SEAPet(pet).cure();
                        }}
                    >
                        治疗
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPetItemUseProp(pet.catchTime);
                        }}
                    >
                        道具
                    </Button>
                </ButtonGroup>
            </PanelField>
        </SeaTableRow>
    );
}
