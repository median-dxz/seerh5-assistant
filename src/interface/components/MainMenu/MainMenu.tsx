import { AssignmentInd, Medication, MenuOpen, ScheduleSend, SmartToy } from '@mui/icons-material';
import { SpeedDialAction } from '@mui/material';
import { SxProps } from '@mui/system';
import { mainColor } from '@sa-ui/style';
import React, { useState } from 'react';
import { StyledSpeedDial } from './StyledSpeedDial';

const iconSx: SxProps = {
    color: `rgba(${mainColor.front} / 100%)`,
    filter: `drop-shadow(0 0 8px rgba(${mainColor.back} / 75%))`,
    opacity: 1,
};

const actions = [
    { icon: <Medication sx={iconSx} />, name: '自动治疗' },
    { icon: <SmartToy sx={iconSx} />, name: '对战谱尼' },
    { icon: <AssignmentInd sx={iconSx} />, name: '一键签到' },
    { icon: <ScheduleSend sx={iconSx} />, name: '一键战队派遣' },
];

export function MainMenu() {
    let [autoCure, setAutoCure] = useState(false);
    let [open, setOpen] = useState(true);
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
        <StyledSpeedDial
            ariaLabel="Seerh5 Assistant Main Menu Button"
            icon={<MenuOpen />}
            direction="right"
            sx={{
                position: 'absolute',
                bottom: '8vh',
                left: '4vw',
                zIndex: 2,
            }}
            open={open}
            onOpen={(event, reason) => {
                setOpen(true);
            }}
            onClose={(event, reason) => {
                if (reason !== 'mouseLeave' && reason !== 'blur') {
                    setOpen(false);
                }
            }}
        >
            {actions.map((action, index) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => {
                        handleClicks[index](), setOpen(true);
                    }}
                />
            ))}
        </StyledSpeedDial>
    );
}
