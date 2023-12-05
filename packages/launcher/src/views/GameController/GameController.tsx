import { Button, Divider, Typography } from '@mui/material';

import { GameConfigRegistry } from 'sea-core';
import { Engine } from 'sea-core/engine';

import { PopupMenuButton } from '@/components/PopupMenuButton';
import { useMainState } from '@/context/useMainState';
import React from 'react';
import useSWR from 'swr';
import { AnimationMode } from './AnimationMode';
import { BattleFireInfo } from './BattleFireInfo';
import { PetBagController } from './PetBagController';

export function GameController() {
    const titleQuery = GameConfigRegistry.getQuery('title');
    const suitQuery = GameConfigRegistry.getQuery('suit');

    const [userTitle, setUserTitle] = React.useState(Engine.playerTitle());
    const [userSuit, setUserSuit] = React.useState(Engine.playerSuit());

    const suits = Engine.playerAbilitySuits();
    const changeSuit = React.useCallback(
        (suit: number) => {
            if (suit !== userSuit) {
                Engine.changeSuit(suit);
                setUserSuit(suit);
            }
        },
        [userSuit]
    );

    const { data: titles } = useSWR('ds://PlayerData/title', Engine.playerAbilityTitles);
    const changeTitle = React.useCallback(
        (title: number) => {
            if (title !== userTitle) {
                Engine.changeTitle(title);
                setUserTitle(title);
            }
        },
        [userTitle]
    );

    const { setOpen } = useMainState();
    const openPetBag = React.useCallback(() => {
        ModuleManager.showModule('petBag');
        setOpen(false);
    }, [setOpen]);

    return (
        <>
            <Button onClick={openPetBag}>打开背包界面</Button>
            <Button onClick={Engine.cureAllPet}>全体治疗</Button>
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
                    renderItem={suitQuery.getName}
                    onSelectItem={changeSuit}
                >
                    {suitQuery.getName(userSuit)}
                </PopupMenuButton>
                <Typography>{`效果: ${ItemSeXMLInfo.getSuitEff(userSuit)}`}</Typography>
            </Typography>

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                称号
                <PopupMenuButton
                    id="change-title"
                    buttonProps={{ sx: { m: 1 }, variant: 'outlined' }}
                    data={titles}
                    renderItem={titleQuery.getName}
                    onSelectItem={changeTitle}
                >
                    {titleQuery.getName(userTitle)}
                </PopupMenuButton>
                <Typography>{`效果: ${titleQuery.get(userTitle)?.abtext}`}</Typography>
            </Typography>

            <Divider />

            <PetBagController />
        </>
    );
}
