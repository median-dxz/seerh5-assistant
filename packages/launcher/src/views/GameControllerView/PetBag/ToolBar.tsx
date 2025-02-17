import { IconButtonNoRipple as IconButton } from '@/components/IconButtonNoRipple';
import { PopupMenuButton } from '@/components/PopupMenuButton';
import { Row } from '@/components/Row';

import { Backpack } from '@/components/icons/Backpack';
import { HealthBroken } from '@/components/icons/HealthBroken';
import { HpBar } from '@/components/icons/HpBar';
import Bookmarks from '@mui/icons-material/Bookmarks';
import Clear from '@mui/icons-material/ClearRounded';

import { DataLoading } from '@/components/DataLoading';
import { launcher } from '@/features/launcher';
import { usePetGroups } from '@/services/launcher';
import { useAppDispatch } from '@/shared';
import { Button, Tooltip, Typography } from '@mui/material';
import type { Pet } from '@sea/core';
import { PetLocation, SEAPetStore, engine, spet } from '@sea/core';
import { useCallback } from 'react';

interface ToolBarProps {
    onLowerHp: () => void;
    onCurePets: () => void;
}

export function ToolBar({ onCurePets, onLowerHp }: ToolBarProps) {
    const dispatch = useAppDispatch();
    const { isFetching, mutate, petGroups } = usePetGroups();

    const handleOpenBag = () => {
        void ModuleManager.showModule('petBag');
        dispatch(launcher.closeMain());
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

    const handleSwitchBag = useCallback(async (group: Pet[]) => {
        if (group.length > 0) {
            await engine.switchBag(group);
            await spet(group[0]).default();
        }
    }, []);

    if (isFetching) {
        return <DataLoading />;
    }

    return (
        <Row
            sx={{
                justifyContent: 'space-between'
            }}
            spacing={0}
        >
            <Row sx={{ width: 'fit-content' }} spacing={2}>
                <Button startIcon={<HpBar />} onClick={onLowerHp}>
                    压血
                </Button>
                <Button startIcon={<HealthBroken />} onClick={onCurePets}>
                    治疗
                </Button>
                <Button startIcon={<Backpack />} onClick={handleOpenBag}>
                    背包
                </Button>
            </Row>

            <PopupMenuButton
                data={loadPets}
                onSelectItem={handleSwitchBag}
                buttonProps={{
                    variant: 'outlined'
                }}
                listItemProps={{ disableRipple: true }}
                renderItem={({ index, item }) => (
                    <PetGroupItem item={item} index={index} onSave={handleSaveGroup} onDelete={handleDeleteGroup} />
                )}
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

function PetGroupItem({ item: group, index, onSave, onDelete }: PetGroupItemProps) {
    const groupString = group.length > 0 ? group.map((i) => i.name).join(', ') : '空';
    return (
        <Row
            sx={{
                fontSize: '1rem',
                justifyContent: 'space-between'
            }}
            spacing={0}
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

            <Row sx={{ width: 'fit-content', justifyContent: 'flex-end' }} spacing={0}>
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
            </Row>
        </Row>
    );
}
