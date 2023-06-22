import { Button, Divider, Typography } from '@mui/material';

import { SAConfig, cureAllPet } from 'sa-core';
import * as SAEngine from 'sa-core/engine';

import { PanelStateContext } from '@sa-app/context/PanelState';

import { PopupMenuButton } from '@sa-app/components/PopupMenuButton';
import React from 'react';
import useSWR from 'swr';
import { AnimationMode } from './AnimationMode';
import { BattleFireInfo } from './BattleFireInfo';
import { PetBagController } from './PetBagController';

const titleName = SAConfig.getName.bind(null, 'title');
const suitName = SAConfig.getName.bind(null, 'suit');

export function GameController() {
    const [userTitle, setUserTitle] = React.useState(SAEngine.getUserTitle());
    const [userSuit, setUserSuit] = React.useState(SAEngine.getUserSuit());

    const suits = SAEngine.getUserAbilitySuits();
    const changeSuit = React.useCallback(
        (suit: number) => {
            if (suit !== userSuit) {
                SAEngine.changeSuit(suit);
                setUserSuit(suit);
            }
        },
        [userSuit]
    );

    const { data: titles } = useSWR('ds://PlayerData/title', SAEngine.getUserAbilityTitles);
    const changeTitle = React.useCallback(
        (title: number) => {
            if (title !== userTitle) {
                SAEngine.changeTitle(title);
                setUserTitle(title);
            }
        },
        [userTitle]
    );

    const { setOpen } = React.useContext(PanelStateContext);
    const openPetBag = React.useCallback(() => {
        ModuleManager.showModule('petBag');
        setOpen(false);
    }, [setOpen]);

    return (
        <>
            <Button onClick={openPetBag}>打开背包界面</Button>
            <Button onClick={cureAllPet}>全体治疗</Button>
            <Divider />

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                火焰信息
                <BattleFireInfo />
            </Typography>

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                动画模式
                <AnimationMode />
            </Typography>

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                套装
                <PopupMenuButton
                    id="change-suit"
                    buttonProps={{ sx: { m: 1 }, variant: 'outlined' }}
                    data={suits}
                    renderItem={suitName}
                    onSelectItem={changeSuit}
                >
                    {SAConfig.getName('suit', userSuit)}
                </PopupMenuButton>
                <Typography>{`效果: ${ItemSeXMLInfo.getSuitEff(userSuit)}`}</Typography>
            </Typography>

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                称号
                <PopupMenuButton
                    id="change-title"
                    buttonProps={{ sx: { m: 1 }, variant: 'outlined' }}
                    data={titles}
                    renderItem={titleName}
                    onSelectItem={changeTitle}
                >
                    {SAConfig.getName('title', userTitle)}
                </PopupMenuButton>
                <Typography>{`效果: ${SAConfig.get('title', userTitle)?.abtext}`}</Typography>
            </Typography>

            <Divider />

            <PetBagController />
        </>
    );
}
