import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Medication from '@mui/icons-material/Medication';
import MenuOpen from '@mui/icons-material/MenuOpen';
import ScheduleSend from '@mui/icons-material/ScheduleSend';
import SmartToy from '@mui/icons-material/SmartToy';

import { SpeedDialAction } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { SaQuickAccess } from '@sa-app/components/styled/QuickAccess';
import { Mods } from '@sa-app/mod-manager';
import { getAutoCureState, toggleAutoCure } from 'sa-core';

const actions = [
    { icon: <Medication />, name: '自动治疗' },
    { icon: <SmartToy />, name: '对战谱尼' },
    { icon: <AssignmentInd />, name: '一键签到' },
    { icon: <ScheduleSend />, name: '一键战队派遣' },
];

export function QuickAccess() {
    const [autoCure, setAutoCure] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        toggleAutoCure(autoCure)
            .then(() => getAutoCureState())
            .then(setAutoCure);
    }, [autoCure]);

    actions[0].name = `自动治疗:${autoCure ? '开' : '关'}`;

    const handleClicks = [
        () => {
            setAutoCure((pre) => !pre);
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
        <SaQuickAccess
            ariaLabel="Seerh5 Assistant Quick Access"
            icon={<MenuOpen />}
            direction="right"
            sx={{
                position: 'absolute',
                bottom: '8vh',
                left: '4vw',
                zIndex: 2,
            }}
            FabProps={{
                sx: {
                    color: (theme) => theme.palette.primary.main,
                },
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
                    FabProps={{
                        sx: {
                            color: (theme) => theme.palette.primary.main,
                        },
                    }}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => {
                        handleClicks[index](), setOpen(true);
                    }}
                />
            ))}
        </SaQuickAccess>
    );
}
