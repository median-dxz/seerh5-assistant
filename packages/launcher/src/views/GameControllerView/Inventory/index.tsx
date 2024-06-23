import { Divider, Stack } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { Selector } from './Selector';

import { Paper } from '@/components/styled/Paper';
import { DS } from '@/constants';
import { GameConfigRegistry, SEAEventSource, engine } from '@sea/core';

export function Inventory() {
    const equipmentQuery = GameConfigRegistry.getQuery('equipment');
    const itemQuery = GameConfigRegistry.getQuery('item');
    const titleQuery = GameConfigRegistry.getQuery('title');
    const suitQuery = GameConfigRegistry.getQuery('suit');

    const changeTitleEventSource = useMemo(
        () =>
            SEAEventSource.eventPattern(
                (handler) => {
                    MainManager.actorInfo.addEventListener(UserInfoEvent.EVENT_CHANGE_TITLE, handler, null);
                },
                (handler) => {
                    MainManager.actorInfo.removeEventListener(UserInfoEvent.EVENT_CHANGE_TITLE, handler, null);
                }
            ),
        []
    );

    const changeClothesEventSource = useMemo(
        () =>
            SEAEventSource.eventPattern(
                (handler) => {
                    MainManager.actorInfo.addEventListener(UserInfoEvent.EVENT_CHANGE_CLOTHERS, handler, null);
                },
                (handler) => {
                    MainManager.actorInfo.removeEventListener(UserInfoEvent.EVENT_CHANGE_CLOTHERS, handler, null);
                }
            ),
        []
    );

    const getEyeEquipment = useCallback(() => {
        const clothesIds = MainManager.actorInfo.clothIDs;
        return clothesIds.map(itemQuery.get).find((clothes) => clothes?.type === 'eye')?.ID;
    }, [itemQuery]);

    const getAllEyeEquipment = useCallback(() => {
        return ItemManager.getClothIDs()
            .map((v) => parseInt(v))
            .map(itemQuery.get)
            .filter(
                (item) => item && item.type === 'eye' && equipmentQuery.find((e) => e.ItemID === item.ID && !e.SuitID)
            )
            .map((item) => item!.ID);
    }, [equipmentQuery, itemQuery]);

    const eyeEquipmentDescription = useCallback(
        (userEyeEquipment: number) => equipmentQuery.find((e) => e.ItemID === userEyeEquipment)?.Desc,
        [equipmentQuery]
    );

    const titleDescription = useCallback((userTitle: number) => titleQuery.get(userTitle)?.abtext, [titleQuery]);

    return (
        <Paper>
            <Stack width="100%" spacing={2} justifyContent="space-around" useFlexGap>
                <Selector
                    id="change-title"
                    label={'称号'}
                    dataKey={DS.multiValue.title}
                    currentItemGetter={engine.playerTitle}
                    allItemGetter={getAllTitles}
                    descriptionGetter={titleDescription}
                    eventSource={changeTitleEventSource}
                    mutate={engine.changeTitle}
                    nameGetter={titleQuery.getName}
                />
                <Divider />
                <Selector
                    id="change-suit"
                    label={'套装'}
                    dataKey={DS.multiValue.suit}
                    currentItemGetter={engine.playerSuit}
                    allItemGetter={engine.playerAbilitySuits}
                    descriptionGetter={suitDescription}
                    eventSource={changeClothesEventSource}
                    mutate={engine.changeSuit}
                    nameGetter={suitQuery.getName}
                />
                <Divider />
                <Selector
                    id="change-eye-equipment"
                    label={'目镜'}
                    dataKey={DS.multiValue.eyeEquipment}
                    currentItemGetter={getEyeEquipment}
                    allItemGetter={getAllEyeEquipment}
                    eventSource={changeClothesEventSource}
                    mutate={changeEyeEquipment}
                    descriptionGetter={eyeEquipmentDescription}
                    nameGetter={itemQuery.getName}
                />
            </Stack>
        </Paper>
    );
}

const getAllTitles = () => engine.playerAbilityTitles;

const suitDescription = (userSuit: number) => ItemSeXMLInfo.getSuitEff(userSuit);

const changeEyeEquipment = (eyeEquipment: number) => {
    engine.changeEquipment('eye', eyeEquipment);
};
