import { Button, ButtonGroup, Checkbox, TableCell, type TableRowProps } from '@mui/material';
import { useEgretImageRes } from '@sa-app/hooks/useEgretRes';
import React from 'react';
import { SAPet, UIModuleHelper, delay, type Pet } from 'sa-core';
import { PanelTableBodyRow } from '../base';

type Props = {
    pet: Pet;
    isDefault: boolean;
    selected: boolean;
} & TableRowProps;

export function PetListRow({ pet, isDefault, selected, onSelect, ...props }: Props) {
    const { src: headIcon } = useEgretImageRes(ClientConfig.getPetHeadPath(pet.id));

    const handleOpenPetItemUseProp = React.useCallback(
        async (ct: number) => {
            await ModuleManager.showModule('petBag');
            const petBagModule = UIModuleHelper.currentModule<petBag.PetBag>();
            await delay(300);
            const petBagPanel = petBagModule.currentPanel!;
            petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
            await delay(300);
            petBagPanel.showDevelopBaseView();
            petBagPanel.showDevelopView(9);
        },
        [pet.catchTime]
    );

    return (
        <PanelTableBodyRow selected={selected} {...props}>
            <TableCell align="center">
                <Checkbox color="primary" checked={selected} />
            </TableCell>
            <TableCell component="th" scope="row" align="center" sx={{ userSelect: 'none', cursor: 'pointer' }}>
                {pet.id}
            </TableCell>
            <TableCell align="center">
                <img crossOrigin="anonymous" src={headIcon} width={48}></img>
            </TableCell>
            <TableCell sx={{ userSelect: 'none', cursor: 'pointer' }} align="center">
                {pet.name}
            </TableCell>
            <TableCell sx={{ userSelect: 'none' }} align="center">
                {pet.baseCurHp} / {pet.baseHpTotal}
            </TableCell>
            <TableCell align="center">
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
                            SAPet(pet.catchTime).cure();
                        }}
                    >
                        治疗
                    </Button>
                    {!isDefault && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                SAPet(pet.catchTime).default();
                            }}
                        >
                            首发
                        </Button>
                    )}
                </ButtonGroup>
            </TableCell>
        </PanelTableBodyRow>
    );
}
