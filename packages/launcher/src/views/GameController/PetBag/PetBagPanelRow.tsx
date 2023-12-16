import { IconButtonNoRipple as IconButton } from '@/components/IconButtonNoRipple';
import { PanelField, useIndex, useRowData } from '@/components/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { useMainState } from '@/context/useMainState';
import { Icon } from '@/service/resource';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import VerticalAlignTop from '@mui/icons-material/VerticalAlignTop';
import { Box, Checkbox, Popover, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Pet, SEAPet, delay } from 'sea-core';
import { Engine, GameConfigRegistry } from 'sea-core/engine';
import { HealthBroken } from './icons/HealthBroken';
import { MoveToInbox } from './icons/MoveToInbox';
import { Pill } from './icons/Pill';

interface PanelRowProps {
    selected: number[];
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}
export function PanelRow({ selected, setSelected }: PanelRowProps) {
    const pet = useRowData<Pet>();
    const index = useIndex();
    const { setOpen } = useMainState();
    const natureQuery = GameConfigRegistry.getQuery('nature');

    const handleOpenPetItemUseProp = React.useCallback(
        async (ct: number) => {
            await ModuleManager.showModule('petBag');
            const petBagModule = Engine.inferCurrentModule<petBag.PetBag>();
            await delay(300);
            const petBagPanel = petBagModule.currentPanel!;
            petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
            await delay(300);
            petBagPanel.showDevelopBaseView();
            petBagPanel.showDevelopView(9);
            setOpen(false);
        },
        [setOpen]
    );

    const [petDetails, setPetDetails] = useState<React.ReactNode>('');
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'pet-details-popover' : undefined;
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <SeaTableRow>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            backdropFilter: 'blur(12px)',
                        },
                    },
                }}
            >
                {petDetails}
            </Popover>
            <PanelField
                field="select"
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
                <Checkbox checked={selected.includes(pet.catchTime)} />
            </PanelField>
            <PanelField
                field="name"
                sx={{ userSelect: 'none' }}
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
                            SEAPet(pet).default();
                        }}
                    >
                        <VerticalAlignTop fontSize="inherit" />
                    </IconButton>
                )}
                <IconButton
                    title="治疗"
                    onClick={() => {
                        SEAPet(pet).cure();
                    }}
                >
                    <HealthBroken />
                </IconButton>
                <IconButton
                    title="入库"
                    onClick={() => {
                        SEAPet(pet).popFromBag();
                    }}
                >
                    <MoveToInbox />
                </IconButton>
                <IconButton
                    title="使用道具"
                    onClick={() => {
                        handleOpenPetItemUseProp(pet.catchTime);
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
    );
}
