import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Medication from '@mui/icons-material/Medication';
import MenuOpen from '@mui/icons-material/MenuOpen';
import ScheduleSend from '@mui/icons-material/ScheduleSend';
import SmartToy from '@mui/icons-material/SmartToy';

import { SpeedDialAction } from '@mui/material';

import { SxProps } from '@mui/system';

import React, { useEffect, useState } from 'react';

import { StyledSpeedDial } from '@sa-app/components/StyledSpeedDial';
import { Mods } from '@sa-app/mod-manager';
import { mainColor } from '@sa-app/style';
import { getAutoCureState, toggleAutoCure } from 'sa-core';

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
    const [autoCure, setAutoCure] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        getAutoCureState().then(setAutoCure);
    }, []);

    actions[0].name = `自动治疗:${autoCure ? '开' : '关'}`;

    const handleClicks = [
        () => {
            toggleAutoCure(!autoCure);
            setAutoCure(autoCure);
        },
        () => {
            FightManager.fightNoMapBoss(6730);
        },
        () => {
            Mods.get('sign')!.reflect('run');
        },
        () => {
            Mods.get('sign')!.reflect('teamDispatch');
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
            onOpen={() => {
                setOpen(true);
            }}
            onClose={(_, reason) => {
                if (reason !== 'blur') {
                    setOpen(false);
                }
            }}
        >
            {actions.map((action, index) => (
                <SpeedDialAction
                    key={index}
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
