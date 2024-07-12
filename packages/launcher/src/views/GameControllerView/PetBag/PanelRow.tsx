import { IconButtonNoRipple as IconButton } from '@/components/IconButtonNoRipple';
import { PanelField, useIndex, useRowData } from '@/components/PanelTable';
import { HealthBroken } from '@/components/icons/HealthBroken';
import { MoveToInbox } from '@/components/icons/MoveToInbox';
import { Pill } from '@/components/icons/Pill';
import { SeaTableRow } from '@/components/styled/TableRow';
import { mainPanelActions } from '@/services/mainPanelSlice';
import { Icon } from '@/services/resource';
import { useAppDispatch } from '@/store';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import VerticalAlignTop from '@mui/icons-material/VerticalAlignTop';
import { Box, Checkbox, Popover, Stack, Typography } from '@mui/material';
import type { Pet } from '@sea/core';
import { GameConfigRegistry, delay, engine, spet } from '@sea/core';
import React, { useState, type ReactNode } from 'react';

interface PanelRowProps {
    selected: number[];
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PanelRow({ selected, setSelected }: PanelRowProps) {
    const pet = useRowData<Pet>();
    const index = useIndex();
    const dispatch = useAppDispatch();
    const natureQuery = GameConfigRegistry.getQuery('nature');

    const [petDetails, setPetDetails] = useState<ReactNode>('');
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'pet-details-popover' : undefined;

    const handleOpenPetItemUseProp = async (ct: number) => {
        await ModuleManager.showModule('petBag');
        const petBagModule = engine.inferCurrentModule<petBag.PetBag>();
        await delay(300);
        const petBagPanel = petBagModule.currentPanel!;
        petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
        await delay(300);
        petBagPanel.showDevelopBaseView();
        petBagPanel.showDevelopView(9);
        dispatch(mainPanelActions.close());
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = () => {
        setSelected((selected) => {
            if (selected.includes(pet.catchTime)) {
                return selected.filter((ct) => ct !== pet.catchTime);
            } else {
                return [...selected, pet.catchTime];
            }
        });
    };

    return (
        <>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                slotProps={{
                    paper: {
                        sx: {
                            backdropFilter: 'blur(12px)'
                        }
                    }
                }}
            >
                {petDetails}
            </Popover>
            <SeaTableRow>
                <PanelField field="select" onClick={handleSelect}>
                    <Checkbox name="pet-checkbox" checked={selected.includes(pet.catchTime)} />
                </PanelField>
                <PanelField field="name" sx={{ userSelect: 'none' }} onClick={handleSelect}>
                    <Stack flexDirection="row" alignItems="center">
                        <img crossOrigin="anonymous" src={Icon.petHead(pet.id)} alt={pet.name} width={48} />
                        <Typography fontSize={16} ml={2}>
                            {pet.name}
                        </Typography>
                    </Stack>
                </PanelField>
                <PanelField field="hp" sx={{ userSelect: 'none' }}>{`${pet.baseCurHp}/${pet.baseMaxHp}`}</PanelField>
                <PanelField field="action">
                    {index !== 0 && (
                        <IconButton
                            title="首发"
                            onClick={(e) => {
                                e.stopPropagation();
                                void spet(pet).default();
                            }}
                        >
                            <VerticalAlignTop fontSize="inherit" />
                        </IconButton>
                    )}
                    <IconButton
                        title="治疗"
                        onClick={() => {
                            spet(pet).cure();
                        }}
                    >
                        <HealthBroken />
                    </IconButton>
                    <IconButton
                        title="入库"
                        onClick={() => {
                            void spet(pet).popFromBag();
                        }}
                    >
                        <MoveToInbox />
                    </IconButton>
                    <IconButton
                        title="使用道具"
                        onClick={() => {
                            void handleOpenPetItemUseProp(pet.catchTime);
                        }}
                    >
                        <Pill />
                    </IconButton>
                    <IconButton
                        aria-describedby={id}
                        title="详情"
                        onClick={(e) => {
                            setPetDetails(
                                <Box sx={{ p: 2 }}>
                                    <Typography fontSize={16}>
                                        {pet.id} {pet.name}
                                    </Typography>
                                    <Typography fontSize={16}>catchtime: {pet.catchTime}</Typography>
                                    <Typography fontSize={16}>lv: {pet.level}</Typography>
                                    <Typography fontSize={16}>
                                        Hp: {pet.baseCurHp} / {pet.baseMaxHp}
                                    </Typography>
                                    <Typography fontSize={16}>天赋: {pet.dv}</Typography>
                                    <Typography fontSize={16}>
                                        性格: {pet.nature} {natureQuery.getName(pet.nature)}
                                    </Typography>
                                    <Typography fontSize={16}>
                                        属性: {pet.element.id} {pet.element.name}
                                    </Typography>
                                </Box>
                            );
                            setAnchorEl(e.currentTarget);
                        }}
                    >
                        <MoreHoriz />
                    </IconButton>
                </PanelField>
            </SeaTableRow>
        </>
    );
}
