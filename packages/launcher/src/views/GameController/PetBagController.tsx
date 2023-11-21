import { Box, Button, ButtonGroup, Checkbox, CircularProgress, LinearProgress, Typography } from '@mui/material';

import * as SEALocalStorage from '@sea-launcher/utils/LocalStorage';
import React from 'react';
import { Pet, SEAPet, UIModuleHelper, delay, lowerBlood, switchBag } from 'sea-core';

import { getPetHeadIcon } from '@sea-launcher/utils/egretRes';
import { useBagPets } from '@sea-launcher/utils/hooks/useBagPets';

import { PanelField, PanelTable, useIndex, useRowData, type PanelColumns } from '@sea-launcher/components/PanelTable';
import { PopupMenuButton } from '@sea-launcher/components/PopupMenuButton';
import { SeaTableRow } from '@sea-launcher/components/styled/TableRow';

const petGroupsStorage = SEALocalStorage.PetGroups;

type BasePetInfo = Pick<Pet, 'catchTime' | 'id' | 'name'>;

function usePetPatternInfos() {
    const [data, setData] = React.useState<BasePetInfo[][]>();
    const [loading, setLoading] = React.useState(false);

    const updater = React.useCallback(async () => {
        setLoading(true);
        const promises = petGroupsStorage.ref
            .flat()
            .map((ct) => SEAPet.get(ct).then((pet) => ({ catchTime: ct, id: pet.id, name: pet.name })));

        const r = await Promise.all(promises);

        const petGroups = petGroupsStorage.ref.map((group) => group.map((pet) => r.find((v) => v.catchTime === pet)!));

        setData(petGroups);
        setLoading(false);
    }, []);

    return [data, loading, updater] as const;
}

export function PetBagController() {
    const { pets } = useBagPets();

    const [selected, setSelected] = React.useState<number[]>([]);
    const [petGroups, loading, updatePetGroups] = usePetPatternInfos();

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

    if (!pets) return <LinearProgress />;

    const handleLowerBlood = () => {
        lowerBlood(selected);
    };

    const handleCurePets = () => {
        for (const cureCt of selected) {
            SEAPet.cure(cureCt);
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
        petGroupsStorage.use((draft) => {
            draft[index] = pets.map((pet) => pet.catchTime);
        });
        updatePetGroups();
    };

    const handleSwitchBag = (group: BasePetInfo[]) => {
        switchBag(group.map((pet) => pet.catchTime));
    };

    return (
        <>
            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                精灵背包
            </Typography>
            <Button onClick={handleLowerBlood}>压血</Button>
            <Button onClick={handleCurePets}>治疗</Button>
            <Button onClick={handleCopyCatchTime}>复制catchTime</Button>

            <PopupMenuButton
                data={petGroups}
                renderItem={pattern}
                onSelectItem={handleSwitchBag}
                buttonProps={{ onClick: updatePetGroups }}
            >
                {loading ? <CircularProgress size={16} /> : '更换方案'}
            </PopupMenuButton>

            <PopupMenuButton
                data={petGroups}
                renderItem={pattern}
                onSelectItem={handleSavePattern}
                buttonProps={{ onClick: updatePetGroups }}
            >
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
        const petBagModule = UIModuleHelper.currentModule<petBag.PetBag>();
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
                <img crossOrigin="anonymous" src={getPetHeadIcon(pet.id)} alt={pet.name} width={48} />
            </PanelField>
            <PanelField field="name">{pet.name}</PanelField>
            <PanelField field="hp">{`${pet.baseCurHp}/${pet.baseMaxHp}`}</PanelField>
            <PanelField field="action">
                <ButtonGroup>
                    {index !== 0 && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                SEAPet.default(pet.catchTime);
                            }}
                        >
                            首发
                        </Button>
                    )}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            SEAPet.cure(pet.catchTime);
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
