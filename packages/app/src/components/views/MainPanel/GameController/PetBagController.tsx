import { Box, Button, LinearProgress, TableCell, Typography } from '@mui/material';
import { PopupMenu, usePopupMenuState } from '@sa-app/components/common/PopupMenu';
import * as SALocalStorage from '@sa-app/hooks/SALocalStorage';
import { mainColor } from '@sa-app/style';
import { produce } from 'immer';
import React from 'react';
import { PetPosition, SAPet, getBagPets, lowerBlood, switchBag } from 'sa-core';

import { useBagPets } from '@sa-app/hooks/useBagPets';
import { PanelTableBase } from '../base';
import { PetListRow } from './PetListRow';

const petGroupsStorage = SALocalStorage.PetGroups;

export function PetBagController() {
    const { pets } = useBagPets();

    const [selected, setSelected] = React.useState<number[]>([]);
    const [petGroups, setPetGroups] = React.useState(petGroupsStorage.ref);
    const [menuProps, openMenu] = usePopupMenuState<number[]>();

    React.useEffect(() => {
        setSelected([]);
    }, [pets]);

    if (!pets) {
        return <LinearProgress />;
    }
    
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
                    '&::-webkit-scrollbar': {
                        width: 8,
                        height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: `rgba(${mainColor.front} / 16%)`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(${mainColor.front} / 90%)`,
                    },
                }}
            >
                <PanelTableBase
                    sx={{
                        width: 'max-content',
                    }}
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
            </Box>
        </>
    );
}
