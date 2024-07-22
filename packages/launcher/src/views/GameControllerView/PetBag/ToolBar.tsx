import { IconButtonNoRipple as IconButton } from '@/components/IconButtonNoRipple';
import { LinerLoading } from '@/components/LinerLoading';
import { PopupMenuButton } from '@/components/PopupMenuButton';
import { Backpack } from '@/components/icons/Backpack';
import { HealthBroken } from '@/components/icons/HealthBroken';
import { HpBar } from '@/components/icons/HpBar';
import { Row } from '@/components/styled/Row';
import { launcherActions } from '@/features/launcherSlice';
import { usePetGroups } from '@/services/config/usePetGroups';
import { useAppDispatch } from '@/store';
import Bookmarks from '@mui/icons-material/Bookmarks';
import Clear from '@mui/icons-material/ClearRounded';
import { Button, Stack, Tooltip, Typography } from '@mui/material';
import type { Pet } from '@sea/core';
import { PetLocation, SEAPetStore, engine, spet } from '@sea/core';
import React, { useCallback } from 'react';

interface ToolBarProps {
    selected: number[];
}

export function ToolBar({ selected }: ToolBarProps) {
    const dispatch = useAppDispatch();
    const { isLoading, mutate, petGroups } = usePetGroups();

    const handleLowerHp = () => {
        void engine.lowerHp(selected);
    };

    const handleCurePets = () => {
        if (selected.length === 0) {
            void engine.cureAllPet();
        } else {
            for (const ct of selected) {
                spet(ct).cure();
            }
        }
    };

    const handleOpenBag = () => {
        void ModuleManager.showModule('petBag');
        dispatch(launcherActions.closeMain());
    };

    const loadPets = useCallback(
        () => Promise.all(petGroups.map((group) => Promise.all(group.map(spet).map((pet) => pet.get())))),
        [petGroups]
    );

    const handleDeleteGroup = useCallback(
        (_: unknown, index: number) => {
            void mutate((groups) => {
                groups[index].splice(0);
            });
        },
        [mutate]
    );

    const handleSaveGroup = useCallback(
        (_: unknown, index: number) => {
            void SEAPetStore.getBagPets(PetLocation.Bag).then((pets) =>
                mutate((groups) => {
                    groups.splice(
                        index,
                        1,
                        pets.map((pet) => pet.catchTime)
                    );
                })
            );
        },
        [mutate]
    );

    const handleSwitchBag = useCallback((group: Pet[]) => {
        if (group.length > 0) {
            void engine.switchBag(group);
        }
    }, []);

    if (isLoading) {
        return <LinerLoading />;
    }

    return (
        <Row
            sx={{
                justifyContent: 'space-between'
            }}
        >
            <Stack
                sx={{
                    flexDirection: 'row'
                }}
                gap={2}
            >
                <Button startIcon={<HpBar />} onClick={handleLowerHp}>
                    压血
                </Button>
                <Button startIcon={<HealthBroken />} onClick={handleCurePets}>
                    治疗
                </Button>
                <Button startIcon={<Backpack />} onClick={handleOpenBag}>
                    背包
                </Button>
            </Stack>

            <PopupMenuButton
                data={loadPets}
                onSelectItem={handleSwitchBag}
                buttonProps={{
                    variant: 'outlined'
                }}
                menuProps={{
                    RenderItem: PetGroupItem,
                    renderItemProps: {
                        onSave: handleSaveGroup,
                        onDelete: handleDeleteGroup
                    },
                    listItemProps: { disableRipple: true }
                }}
            >
                精灵方案
            </PopupMenuButton>
        </Row>
    );
}

interface PetGroupItemProps {
    item: Pet[];
    index: number;
    onSave: (group: Pet[], index: number) => void;
    onDelete: (group: Pet[], index: number) => void;
}

const PetGroupItem = React.memo(({ item: group, index, onSave, onDelete }: PetGroupItemProps) => {
    const groupString = group.length > 0 ? group.map((i) => i.name).join(', ') : '空';
    return (
        <Row
            sx={{
                fontSize: '1rem'
            }}
            justifyContent="space-between"
        >
            <Tooltip title={group.length > 0 ? groupString : ''}>
                <Typography
                    width="100%"
                    fontSize="inherit"
                    noWrap
                    textAlign="center"
                    textOverflow="ellipsis"
                    overflow="hidden"
                >
                    {`方案${index + 1}: ${groupString}`}
                </Typography>
            </Tooltip>

            <Stack flexDirection="row" ml={2}>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave(group, index);
                    }}
                >
                    <Bookmarks fontSize="inherit" />
                </IconButton>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(group, index);
                    }}
                >
                    <Clear fontSize="inherit" />
                </IconButton>
            </Stack>
        </Row>
    );
});
