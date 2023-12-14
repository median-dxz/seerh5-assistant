import { PopupMenuButton } from '@/components/PopupMenuButton';
import { Box, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Engine, GameConfigRegistry, SEAEventSource, Subscription } from 'sea-core';

import { ClampText } from './styled/ClampText';
import { StyledRow } from './styled/StyledRow';

export function TitleSelector() {
    const titleQuery = useMemo(() => GameConfigRegistry.getQuery('title'), []);
    const [userTitle, setUserTitle] = useState<undefined | number>(Engine.playerTitle());

    useEffect(() => {
        const sub = new Subscription();
        sub.on(
            SEAEventSource.eventPattern(
                (handler) => {
                    MainManager.actorInfo.addEventListener(UserInfoEvent.EVENT_CHANGE_TITLE, handler, null);
                },
                (handler) => {
                    MainManager.actorInfo.removeEventListener(UserInfoEvent.EVENT_CHANGE_TITLE, handler, null);
                }
            ),
            () => {
                setUserTitle(Engine.playerTitle());
            }
        );
        return () => {
            sub.dispose();
        };
    }, []);

    const changeTitle = React.useCallback(
        (title: number) => {
            if (title !== userTitle) {
                Engine.changeTitle(title);
            }
        },
        [userTitle]
    );

    const titleEffectDescription = `${userTitle ? titleQuery.get(userTitle)?.abtext ?? '无' : '无'}`;

    return (
        <StyledRow>
            <Typography fontWeight="bold" fontFamily={['Noto Sans SC', 'sans-serif']} sx={{ whiteSpace: 'nowrap' }}>
                称号
            </Typography>
            <PopupMenuButton
                id="change-title"
                buttonProps={{
                    variant: 'outlined',
                    sx: { whiteSpace: 'nowrap', width: '50%', textOverflow: 'ellipsis' },
                }}
                data={Engine.playerAbilityTitles}
                renderItem={titleQuery.getName}
                onSelectItem={changeTitle}
            >
                {userTitle ? titleQuery.getName(userTitle) : '无称号'}
            </PopupMenuButton>
            <Tooltip title={titleEffectDescription}>
                <Box>
                    <ClampText accessibility={false} is="p" lines={2} debounce={150} text={titleEffectDescription} />
                </Box>
            </Tooltip>
        </StyledRow>
    );
}
