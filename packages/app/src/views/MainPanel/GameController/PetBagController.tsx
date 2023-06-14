import { Box, Button, ButtonGroup, Checkbox, LinearProgress, Typography } from '@mui/material';

import * as SALocalStorage from '@sa-app/utils/hooks/SALocalStorage';
import React from 'react';
import { Pet, PetPosition, SAPet, UIModuleHelper, delay, getBagPets, lowerBlood, switchBag } from 'sa-core';

import { PopupMenu } from '@sa-app/components/PopupMenu';
import { usePopupMenuState } from '@sa-app/components/usePopupMenuState';
import { getPetHeadIcon } from '@sa-app/utils/egretRes';
import { useBagPets } from '@sa-app/utils/hooks/useBagPets';

import { PanelColumnRender, PanelColumns, PanelTable } from '../../../components/PanelTable/PanelTable';

const petGroupsStorage = SALocalStorage.PetGroups;

export function PetBagController() {
    const { pets } = useBagPets();

    const [selected, setSelected] = React.useState<number[]>([]);
    const [petGroups, setPetGroups] = React.useState(petGroupsStorage.ref);
    const [menuProps, openMenu] = usePopupMenuState<number[]>();

    React.useEffect(() => {
        setSelected([]);
    }, [pets]);

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

    const cols: PanelColumns = React.useMemo(
        () => [
            { columnName: '', field: 'select' },
            { columnName: 'id', field: 'id', sx: { userSelect: 'none', cursor: 'pointer' } },
            { columnName: '', field: 'icon', sx: { userSelect: 'none' } },
            { columnName: '名称', field: 'name', sx: { userSelect: 'none', cursor: 'pointer' } },
            { columnName: '血量', field: 'hp' },
            { columnName: '操作', field: 'action' },
        ],
        []
    );

    const colRender: PanelColumnRender<Pet> = React.useCallback(
        (pet, index) => ({
            select: <Checkbox checked={selected.includes(pet.catchTime)} />,
            id: pet.id,
            icon: <img crossOrigin="anonymous" src={getPetHeadIcon(pet.id)} alt={pet.name} width={48} />,
            name: pet.name,
            hp: `${pet.baseCurHp}/${pet.baseMaxHp}`,
            action: (
                <ButtonGroup>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPetItemUseProp(pet.catchTime);
                        }}
                    >
                        道具
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            SAPet.cure(pet.catchTime);
                        }}
                    >
                        治疗
                    </Button>
                    {index !== 0 && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                SAPet.default(pet.catchTime);
                            }}
                        >
                            首发
                        </Button>
                    )}
                </ButtonGroup>
            ),
        }),
        [handleOpenPetItemUseProp, selected]
    );

    const toRowKey = React.useCallback((pet: Pet) => pet.catchTime, []);

    const rowProps = React.useCallback(
        (pet: Pet) => ({
            onClick: () => {
                setSelected((selected) => {
                    if (selected.includes(pet.catchTime)) {
                        return selected.filter((ct) => ct !== pet.catchTime);
                    } else {
                        return [...selected, pet.catchTime];
                    }
                });
            },
        }),
        []
    );

    if (!pets) return <LinearProgress />;

    const handleLowerBlood = () => {
        lowerBlood(selected);
    };

    const handleCurePets = () => {
        for (const cureCt of selected) {
            SAPet.cure(cureCt);
        }
    };

    const handleCopyCatchTime = () => {
        navigator.clipboard.writeText(
            JSON.stringify(pets.map((pet) => ({ name: pet.name, catchTime: pet.catchTime })))
        );
        BubblerManager.getInstance().showText('复制成功');
    };

    const handleChangePetPattern: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        const target = e.currentTarget;
        const pattern = [];
        for (let index = 0; index < petGroups.length; index++) {
            const pets = await Promise.all(petGroups[index]?.map((ct) => SAPet.get(ct)) ?? []);
            const name = `方案${index}: ${pets.map((pet) => pet.name).join(',')}`;
            pattern.push(name);
        }

        openMenu(target, {
            data: petGroups,
            displayText: pattern,
            handler: (item) => switchBag(item),
        });
    };

    const handleSavePetPattern: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        const target = e.currentTarget;
        const patternName = petGroups.map((v, index) => `方案${index}`);

        openMenu(target, {
            data: petGroups,
            displayText: patternName,
            handler: async (item, index) => {
                const pets = await getBagPets(PetPosition.bag1);
                petGroupsStorage.use((draft) => {
                    draft[index] = pets.map((pet) => pet.catchTime);
                });
                setPetGroups(petGroupsStorage.ref);
            },
        });
    };

    return (
        <>
            <PopupMenu id="pet-bag-controller-menu" {...menuProps} />

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                精灵背包
            </Typography>
            <Button onClick={handleLowerBlood}>压血</Button>
            <Button onClick={handleCurePets}>治疗</Button>
            <Button onClick={handleCopyCatchTime}>复制catchTime</Button>
            <Button onClick={handleChangePetPattern}>更换方案</Button>
            <Button onClick={handleSavePetPattern}>保存方案</Button>

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
                    columnRender={colRender}
                    data={pets}
                    toRowKey={toRowKey}
                    rowProps={rowProps}
                />
            </Box>
        </>
    );
}
