import { Button, LinearProgress, TableCell } from '@mui/material';
import { PopupMenu, usePopupMenuState } from '@sa-app/components/common/PopupMenu';
import { SALocalStorage } from '@sa-app/hooks/GlobalConfig';
import { mainColor } from '@sa-app/style';
import produce from 'immer';
import React from 'react';
import { PetPosition, SAPet, getBagPets, lowerBlood, switchBag } from 'seerh5-assistant-core';

import { useBagPets } from '@sa-app/hooks/useBagPets';
import { PanelTableBase } from '../base';
import { PetListRow } from './PetListRow';

const petGroupsStorage = SALocalStorage.PetGroups;

export function PetBagController() {
    const { pets } = useBagPets();

    if (!pets) {
        return <LinearProgress />;
    }

    const [selected, setSelected] = React.useState<number[]>([]);
    const [petGroups, setPetGroups] = React.useState(petGroupsStorage.ref);
    const [menuProps, openMenu] = usePopupMenuState<number[]>();

    React.useEffect(() => {
        setSelected([]);
    }, [pets]);

    const handleLowerBlood = () => {
        lowerBlood(selected);
    };

    const handleCurePets = () => {
        for (let cureCt of selected) {
            SAPet(cureCt).cure();
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
            const pets = await Promise.all(petGroups[index]?.map(Number).map((ct) => SAPet(ct).name) ?? []);
            const name = `方案${index}: ${pets.join(',')}`;
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
            <h3>精灵背包</h3>
            <Button onClick={handleLowerBlood}>压血</Button>
            <Button onClick={handleCurePets}>治疗</Button>
            <Button onClick={handleCopyCatchTime}>复制catchTime</Button>
            <Button onClick={handleChangePetPattern}>更换方案</Button>
            <Button onClick={handleSavePetPattern}>保存方案</Button>
            <PopupMenu
                id="pet-bag-controller-menu"
                sx={{
                    '& .MuiPaper-root': {
                        bgcolor: `rgba(${mainColor.front} / 18%)`,
                        backdropFilter: 'blur(4px)',
                    },
                }}
                {...menuProps}
            />
            <PanelTableBase
                aria-label="pet list"
                size="small"
                heads={
                    <>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">id</TableCell>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">名称</TableCell>
                        <TableCell align="center">血量</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </>
                }
            >
                {pets.map((row, index) => (
                    <PetListRow
                        key={row.catchTime}
                        pet={row}
                        selected={selected.includes(row.catchTime)}
                        isDefault={index === 0}
                        onClick={() =>
                            setSelected(
                                produce((draft) => {
                                    if (draft.includes(row.catchTime)) {
                                        draft.splice(draft.indexOf(row.catchTime), 1);
                                    } else {
                                        draft.push(row.catchTime);
                                    }
                                })
                            )
                        }
                    />
                ))}
            </PanelTableBase>
        </>
    );
}
