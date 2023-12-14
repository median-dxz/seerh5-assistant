import { PopupMenuButton } from '@/components/PopupMenuButton';
import { Box, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GameConfigRegistry, SEAEventSource, Subscription } from 'sea-core';

import { ClampText } from './styled/ClampText';
import { StyledRow } from './styled/StyledRow';

export function EyeItemSelector() {
    const itemQuery = useMemo(() => GameConfigRegistry.getQuery('item'), []);
    const getEyeItemFromClothes = useCallback(() => {
        const clothesIds = MainManager.actorInfo.clothIDs;
        return clothesIds.map(itemQuery.get).find((clothes) => clothes?.type === 'eye')?.ID;
    }, [itemQuery]);
    const [userEyeItem, setUserEyeItem] = useState<undefined | number>(getEyeItemFromClothes());

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
                setUserEyeItem(getEyeItemFromClothes());
            }
        );
        return () => {
            sub.dispose();
        };
    }, [getEyeItemFromClothes]);

    const changeEyeItem = React.useCallback(
        (eyeItem: number) => {
            if (eyeItem !== userEyeItem) {
                // Engine.changeSuit(eyeItem);
            }
        },
        [userEyeItem]
    );

    const eyeItemEffectDescription = '';

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
                    .map(itemQuery.get)
                    .filter((item) => item?.type === 'eye')
                    .map((item) => item.ID)}

                renderItem={itemQuery.getName}
                onSelectItem={changeEyeItem}
            >
                {userEyeItem ? itemQuery.getName(userEyeItem) : '无'}
            </PopupMenuButton>
            <Tooltip title={eyeItemEffectDescription}>
                <Box>
                    <ClampText accessibility={false} is="p" lines={2} debounce={150} text={eyeItemEffectDescription} />
                </Box>
            </Tooltip>
        </StyledRow>
    );
}
