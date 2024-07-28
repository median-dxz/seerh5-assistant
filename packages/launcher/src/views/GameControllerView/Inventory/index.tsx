import { Divider, Paper, Stack } from '@mui/material';
import { useCallback } from 'react';

import { Selector } from './Selector';

import { SEAEventSource, engine, query } from '@sea/core';

const changeTitleEventSource = SEAEventSource.eventPattern(
    (handler) => {
        MainManager.actorInfo.addEventListener(UserInfoEvent.EVENT_CHANGE_TITLE, handler, null);
    },
    (handler) => {
        MainManager.actorInfo.removeEventListener(UserInfoEvent.EVENT_CHANGE_TITLE, handler, null);
    }
);

const changeClothesEventSource = SEAEventSource.eventPattern(
    (handler) => {
        MainManager.actorInfo.addEventListener(UserInfoEvent.EVENT_CHANGE_CLOTHERS, handler, null);
    },
    (handler) => {
        MainManager.actorInfo.removeEventListener(UserInfoEvent.EVENT_CHANGE_CLOTHERS, handler, null);
    }
);

export function Inventory() {
    const equipmentQuery = query('equipment');
    const itemQuery = query('item');
    const titleQuery = query('title');
    const suitQuery = query('suit');

    const getEyeEquipment = useCallback(() => {
        const clothesIds = MainManager.actorInfo.clothIDs;
        return clothesIds.map(itemQuery.get).find((clothes) => clothes?.type === 'eye')?.ID;
    }, [itemQuery]);

    const getAllEyeEquipment = useCallback(
        async () =>
            Promise.resolve(
                ItemManager.getClothIDs()
                    .map((v) => parseInt(v))
                    .map(itemQuery.get)
                    .filter(
                        (item) =>
                            item && item.type === 'eye' && equipmentQuery.find((e) => e.ItemID === item.ID && !e.SuitID)
                    )
                    .map((item) => item!.ID)
            ),
        [equipmentQuery, itemQuery]
    );

    const eyeEquipmentDescription = useCallback(
        (userEyeEquipment: number) => equipmentQuery.find((e) => e.ItemID === userEyeEquipment)?.Desc,
        [equipmentQuery]
    );

    const titleDescription = useCallback((userTitle: number) => titleQuery.get(userTitle)?.abtext, [titleQuery]);

    return (
        <Paper sx={{ p: 4 }}>
            <Stack sx={{ width: '100%', justifyContent: 'space-around' }} spacing={2}>
                <Selector
                    id="change-title"
                    label={'称号'}
                    currentItemGetter={engine.playerTitle}
                    allItemGetter={engine.playerAbilityTitles}
                    descriptionGetter={titleDescription}
                    eventSource={changeTitleEventSource}
                    mutate={engine.changeTitle}
                    nameGetter={titleQuery.getName}
                />
                <Divider />
                <Selector
                    id="change-suit"
                    label={'套装'}
                    currentItemGetter={engine.playerSuit}
                    allItemGetter={() => Promise.resolve(engine.playerAbilitySuits())}
                    descriptionGetter={suitDescription}
                    eventSource={changeClothesEventSource}
                    mutate={engine.changeSuit}
                    nameGetter={suitQuery.getName}
                />
                <Divider />
                <Selector
                    id="change-eye-equipment"
                    label={'目镜'}
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

const suitDescription = (userSuit: number) => ItemSeXMLInfo.getSuitEff(userSuit);

const changeEyeEquipment = (eyeEquipment: number) => {
    void engine.changeEquipment('eye', eyeEquipment);
};
