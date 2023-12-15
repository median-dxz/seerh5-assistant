import { PopupMenuButton } from '@/components/PopupMenuButton';
import { Box, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Engine, GameConfigRegistry, SEAEventSource, Subscription } from 'sea-core';

import { ClampText } from './styled/ClampText';
import { StyledRow } from './styled/StyledRow';

export function EyeEquipmentSelector() {
    const equipmentQuery = useMemo(() => GameConfigRegistry.getQuery('equipment'), []);
    const itemQuery = useMemo(() => GameConfigRegistry.getQuery('item'), []);

    const getEyeEquipmentFromClothes = useCallback(() => {
        const clothesIds = MainManager.actorInfo.clothIDs;
        return clothesIds.map(itemQuery.get).find((clothes) => clothes?.type === 'eye')?.ID;
    }, [itemQuery]);
    const [userEyeEquipment, setUserEyeEquipment] = useState<undefined | number>(getEyeEquipmentFromClothes());

    useEffect(() => {
        const sub = new Subscription();
        sub.on(
            SEAEventSource.eventPattern(
                (handler) => {
                    MainManager.actorInfo.addEventListener(UserInfoEvent.EVENT_CHANGE_CLOTHERS, handler, null);
                },
                (handler) => {
                    MainManager.actorInfo.removeEventListener(UserInfoEvent.EVENT_CHANGE_CLOTHERS, handler, null);
                }
            ),
            () => {
                setUserEyeEquipment(getEyeEquipmentFromClothes());
            }
        );
        return () => {
            sub.dispose();
        };
    }, [getEyeEquipmentFromClothes]);

    const changeEyeEquipment = React.useCallback(
        (eyeEquipment: number) => {
            if (eyeEquipment !== userEyeEquipment) {
                Engine.changeEquipment('eye', eyeEquipment);
            }
        },
        [userEyeEquipment]
    );

    const eyeEquipmentEffectDescription = equipmentQuery.find((e) => e.ItemID === userEyeEquipment)?.Desc ?? '无';

    return (
        <StyledRow>
            <Typography fontWeight="bold" fontFamily={['Noto Sans SC', 'sans-serif']} sx={{ whiteSpace: 'nowrap' }}>
                目镜
            </Typography>
            <PopupMenuButton
                id="change-title"
                buttonProps={{
                    variant: 'outlined',
                    sx: { whiteSpace: 'nowrap', width: '50%', textOverflow: 'ellipsis' },
                }}
                data={ItemManager.getClothIDs()
                    .map((v) => parseInt(v))
                    .map(itemQuery.get)
                    .filter((item) => item && item.type === 'eye' && equipmentQuery.find((e) => e.ItemID === item.ID && !e.SuitID))
                    .map((item) => item!.ID)}
                renderItem={itemQuery.getName}
                onSelectItem={changeEyeEquipment}
            >
                {userEyeEquipment ? itemQuery.getName(userEyeEquipment) : '无'}
            </PopupMenuButton>
            <Tooltip title={eyeEquipmentEffectDescription}>
                <Box>
                    <ClampText
                        accessibility={false}
                        is="p"
                        lines={2}
                        debounce={150}
                        text={eyeEquipmentEffectDescription}
                    />
                </Box>
            </Tooltip>
        </StyledRow>
    );
}
