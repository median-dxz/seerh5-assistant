import { Button, Divider, Typography } from '@mui/material';

import { GameConfig, cureAllPet } from 'sea-core';
import * as Engine from 'sea-core/engine';

import { PanelStateContext } from '@sea-launcher/context/PanelState';

import { PopupMenuButton } from '@sea-launcher/components/PopupMenuButton';
import React from 'react';
import useSWR from 'swr';
import { AnimationMode } from './AnimationMode';
import { BattleFireInfo } from './BattleFireInfo';
import { PetBagController } from './PetBagController';

const titleName = GameConfig.getName.bind(null, 'title');
const suitName = GameConfig.getName.bind(null, 'suit');

export function GameController() {
    const [userTitle, setUserTitle] = React.useState(Engine.getUserTitle());
    const [userSuit, setUserSuit] = React.useState(Engine.getUserSuit());

    const suits = Engine.getUserAbilitySuits();
    const changeSuit = React.useCallback(
        (suit: number) => {
            if (suit !== userSuit) {
                Engine.changeSuit(suit);
                setUserSuit(suit);
            }
        },
        [userSuit]
    );

    const { data: titles } = useSWR('ds://PlayerData/title', Engine.getUserAbilityTitles);
    const changeTitle = React.useCallback(
        (title: number) => {
            if (title !== userTitle) {
                Engine.changeTitle(title);
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
                    {GameConfig.getName('suit', userSuit)}
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
                    {GameConfig.getName('title', userTitle)}
                </PopupMenuButton>
                <Typography>{`效果: ${GameConfig.get('title', userTitle)?.abtext}`}</Typography>
            </Typography>

            <Divider />

            <PetBagController />
        </>
    );
}
