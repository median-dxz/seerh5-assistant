import { AssignmentInd, Medication, MenuOpen, ScheduleSend, SmartToy } from '@mui/icons-material';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';
import { SvgButton } from './HexagonalButton';

const actions = [
    { icon: <Medication />, name: '自动治疗' },
    { icon: <SmartToy />, name: '对战谱尼' },
    { icon: <AssignmentInd />, name: '一键签到' },
    { icon: <ScheduleSend />, name: '一键战队派遣' },
];

export function MainMenu() {
    let [autoCure, setAutoCure] = useState(false);
    const handleClicks = [
        () => {
            const { SA } = window;
            setAutoCure(!autoCure);
            SA.PetHelper.ToggleAutoCure(autoCure);
            BubblerManager.getInstance().showText(autoCure ? '自动治疗开启' : '自动治疗关闭');
        },
        () => {
            FightManager.fightNoMapBoss(6730);
        },
        () => {
            const { SAMods: mods } = window;
            mods.get('sign')!.run!();
        },
        () => {
            const { SAMods: mods } = window;
            mods.get('sign')!.reflect('teamDispatch');
        },
    ];

    return (
        <>
            <SvgButton onClick={() => {}}>
                <MenuOpen />
            </SvgButton>
            <SpeedDial ariaLabel="Seerh5 Assistant Main Menu Button" icon={<MenuOpen />}>
                {actions.map((action, index) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={handleClicks[index]}
                    />
                ))}
            </SpeedDial>
        </>
    );
}
