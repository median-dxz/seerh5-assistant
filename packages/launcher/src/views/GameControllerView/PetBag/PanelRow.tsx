import { IconButtonNoRipple as IconButton } from '@/components/IconButtonNoRipple';
import { PanelField, useIndex, useRowData } from '@/components/PanelTable';
import { HealthBroken } from '@/components/icons/HealthBroken';
import { MoveToInbox } from '@/components/icons/MoveToInbox';
import { Pill } from '@/components/icons/Pill';
import { SeaTableRow } from '@/components/styled/TableRow';
import { launcherActions } from '@/features/launcherSlice';
import { Icon } from '@/services/resource';
import { usePopupState } from '@/shared';
import { useAppDispatch } from '@/store';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import VerticalAlignTop from '@mui/icons-material/VerticalAlignTop';
import { Checkbox, Popover, Stack, Typography } from '@mui/material';
import type { Pet } from '@sea/core';
import { GameConfigRegistry, delay, engine, spet } from '@sea/core';

interface PanelRowProps {
    isFetching: boolean;
    selected: number[];
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PanelRow({ isFetching, selected, setSelected }: PanelRowProps) {
    const pet = useRowData<Pet>();
    const index = useIndex();
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
        dispatch(launcherActions.closeMain());
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
                    paper: { sx: { p: 2, fontSize: '1rem' } }
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
            </SeaTableRow>
        </>
    );
}
