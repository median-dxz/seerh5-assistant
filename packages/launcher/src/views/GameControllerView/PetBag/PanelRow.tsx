import { HealthBroken } from '@/components/icons/HealthBroken';
import { MoveToInbox } from '@/components/icons/MoveToInbox';
import { Pill } from '@/components/icons/Pill';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import VerticalAlignTop from '@mui/icons-material/VerticalAlignTop';

import { alpha, Checkbox, Popover, Stack, Typography } from '@mui/material';

import type { Pet } from '@sea/core';
import { delay, engine, GameConfigRegistry, spet } from '@sea/core';

import { IconButtonNoRipple as IconButton } from '@/components/IconButtonNoRipple';
import { PanelField } from '@/components/SEAPanelTable/PanelField';
import { TableRow } from '@/components/TableRow';

import { launcher } from '@/features/launcher';
import { Icon } from '@/services/resource';
import { useAppDispatch, usePopupState } from '@/shared';

interface PanelRowProps {
    isFetching: boolean;
    onSelect: (selected: boolean) => void;
    selected: boolean;
    pet: Pet;
    index: number;
}

export function PanelRow({ isFetching, onSelect, selected, pet, index }: PanelRowProps) {
    const dispatch = useAppDispatch();
    const natureQuery = GameConfigRegistry.getQuery('nature');

    const { state: detailsState, open } = usePopupState({
        popupId: 'pet-details-popover'
    });

    const handleOpenPetItemUseProp = async (ct: number) => {
        await ModuleManager.showModule('petBag');
        const petBagModule = engine.inferCurrentModule<petBag.PetBag>();
        await delay(300);
        const petBagPanel = petBagModule.currentPanel!;
        petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
        await delay(300);
        petBagPanel.showDevelopBaseView();
        petBagPanel.showDevelopView(9);
        dispatch(launcher.closeMain());
    };

    const handleSelect = () => {
        onSelect(!selected);
    };

    return (
        <>
            <Popover
                {...detailsState}
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
                            p: 2,
                            backgroundColor: ({ palette }) => alpha(palette.primary.main, 0.08),
                            fontSize: '1rem'
                        }
                    }
                }}
            >
                <Typography variant="inherit">
                    {pet.id} {pet.name}
                </Typography>
                <Typography variant="inherit">catchtime: {pet.catchTime}</Typography>
                <Typography variant="inherit">lv: {pet.level}</Typography>
                <Typography variant="inherit">
                    Hp: {pet.baseCurHp} / {pet.baseMaxHp}
                </Typography>
                <Typography variant="inherit">天赋: {pet.dv}</Typography>
                <Typography variant="inherit">
                    性格: {pet.nature} {natureQuery.getName(pet.nature)}
                </Typography>
                <Typography variant="inherit">
                    属性: {pet.element.id} {pet.element.name}
                </Typography>
            </Popover>
            <TableRow>
                <PanelField field="select" onClick={handleSelect}>
                    <Checkbox name="pet-checkbox" checked={selected} />
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
                            disabled={isFetching}
                            onClick={() => {
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
                        disabled={isFetching}
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
                    <IconButton title="详情" onClick={open}>
                        <MoreHoriz />
                    </IconButton>
                </PanelField>
            </TableRow>
        </>
    );
}
