import { AssignmentInd, Medication, MenuOpen, ScheduleSend, SmartToy } from '@mui/icons-material';
import { SpeedDial as SpeedDialRaw, SpeedDialAction } from '@mui/material';
import { styled, SxProps } from '@mui/system';
import { mainColor } from '@sa-ui/style';
import React, { useState } from 'react';
import { MainButton } from './HexagonalButton';

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

const SpeedDial: typeof SpeedDialRaw = styled(SpeedDialRaw)`
    & .MuiSpeedDial-fab {
        color: rgba(${mainColor.back} / 100%);
        background-color: rgba(${mainColor.front} / 100%);
        box-shadow: 0 0 12px rgba(${mainColor.back} / 24%);
        transition: all 0.3s !important;
    }
    & .MuiSpeedDial-fab:hover {
        color: rgba(${mainColor.front} / 100%);
        background-color: rgb(103 225 255);
    }
    & .MuiSpeedDial-actions .MuiFab-root {
        border: none;
        background: none;
        box-shadow: none;
        border-radius: 0;
        &::after {
            content: ' ';
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            border-top: 1px solid rgba(${mainColor.front} / 100%);
            box-shadow: 0 0 4px rgba(${mainColor.back} / 100%);
            transition: width 0.3s;
        }

        &::before {
            content: ' ';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 0;
            border-bottom: 1px solid rgba(${mainColor.front} / 100%);
            box-shadow: 0 0 4px rgba(${mainColor.back} / 100%);
            transition: width 0.3s;
        }

        :hover {
            &::before,
            &::after {
                width: 100%;
            }
        }
    }
`;

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
        <>
            <MainButton onClick={() => {}} baseSize={36}>
                <MenuOpen />
            </MainButton>
            <SpeedDial
                ariaLabel="Seerh5 Assistant Main Menu Button"
                icon={<MenuOpen />}
                direction="right"
                open={open}
                onClick={() => {
                    setOpen((preState) => !preState);
                }}
            >
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
