import { Divider, Stack } from '@mui/material';

import { Paper } from '@/components/Paper';
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

const suitDescription = (userSuit: number) => ItemSeXMLInfo.getSuitEff(userSuit);

const changeEyeEquipment = (eyeEquipment: number) => {
    void engine.changeEquipment('eye', eyeEquipment);
};

const currentEyeEquipment = () => {
    const clothesIds = MainManager.actorInfo.clothIDs;
    return clothesIds.map(query('item').get).find((clothes) => clothes?.type === 'eye')?.ID;
};

const allEyeEquipment = () =>
    ItemManager.getClothIDs()
        .map((v) => parseInt(v))
        .map(query('item').get)
        .filter(
            (item) => item && item.type === 'eye' && query('equipment').find((e) => e.ItemID === item.ID && !e.SuitID)
        )
        .map((item) => item!.ID);

const eyeEquipmentDescription = (eyeEquipment: number) =>
    query('equipment').find((e) => e.ItemID === eyeEquipment)?.Desc;

const titleDescription = (title: number) => query('title').get(title)?.abtext;

export function Inventory() {
    return (
        <Paper sx={{ p: 4 }}>
            <Stack sx={{ width: '100%', justifyContent: 'space-around' }} spacing={2}>
                <Selector
                    id="change-title"
                    label={'称号'}
                    getCurrentItem={engine.playerTitle}
                    fetchAllItems={engine.playerAbilityTitles}
                    getDescription={titleDescription}
                    eventSource={changeTitleEventSource}
                    mutate={engine.changeTitle}
                    getName={query('title').getName}
                />
                <Divider />
                <Selector
                    id="change-suit"
                    label={'套装'}
                    getCurrentItem={engine.playerSuit}
                    fetchAllItems={engine.playerAbilitySuits}
                    getDescription={suitDescription}
                    eventSource={changeClothesEventSource}
                    mutate={engine.changeSuit}
                    getName={query('suit').getName}
                />
                <Divider />
                <Selector
                    id="change-eye-equipment"
                    label={'目镜'}
                    getCurrentItem={currentEyeEquipment}
                    fetchAllItems={allEyeEquipment}
                    eventSource={changeClothesEventSource}
                    mutate={changeEyeEquipment}
                    getDescription={eyeEquipmentDescription}
                    getName={query('item').getName}
                />
            </Stack>
        </Paper>
    );
}
