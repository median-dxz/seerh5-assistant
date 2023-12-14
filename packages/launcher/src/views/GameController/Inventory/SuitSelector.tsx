import { PopupMenuButton } from '@/components/PopupMenuButton';
import { Box, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Engine, GameConfigRegistry, SEAEventSource, Subscription } from 'sea-core';

import { ClampText } from './styled/ClampText';
import { StyledRow } from './styled/StyledRow';

export function SuitSelector() {
    const suitQuery = useMemo(() => GameConfigRegistry.getQuery('suit'), []);
    const [userSuit, setUserSuit] = useState<undefined | number>(Engine.playerSuit());

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
                setUserSuit(Engine.playerSuit());
            }
        );
        return () => {
            sub.dispose();
        };
    }, []);

    const changeSuit = React.useCallback(
        (suit: number) => {
            if (suit !== userSuit) {
                Engine.changeSuit(suit);
            }
        },
        [userSuit]
    );

    const suitEffectDescription = `${userSuit ? ItemSeXMLInfo.getSuitEff(userSuit) ?? '无' : '无'}`;

    return (
        <StyledRow>
            <Typography fontWeight="bold" fontFamily={['Noto Sans SC', 'sans-serif']} sx={{ whiteSpace: 'nowrap' }}>
                套装
            </Typography>
            <PopupMenuButton
                id="change-Suit"
                buttonProps={{
                    variant: 'outlined',
                    sx: { whiteSpace: 'nowrap', width: '50%', textOverflow: 'ellipsis' },
                }}
                data={Engine.playerAbilitySuits()}
                renderItem={suitQuery.getName}
                onSelectItem={changeSuit}
            >
                {userSuit ? suitQuery.getName(userSuit) : '无'}
            </PopupMenuButton>
            <Tooltip title={suitEffectDescription}>
                <Box>
                    <ClampText accessibility={false} is="p" lines={2} debounce={150} text={suitEffectDescription} />
                </Box>
            </Tooltip>
        </StyledRow>
    );
}
