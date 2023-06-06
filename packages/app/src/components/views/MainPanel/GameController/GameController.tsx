import { Button, Divider, Typography } from '@mui/material';

import { SAConfig, cureAllPet } from 'sa-core';
import * as SAEngine from 'sa-core/engine';

import { PopupMenu, PopupMenuItemHandler } from '@sa-app/components/common/PopupMenu';
import { usePopupMenuState } from '@sa-app/components/common/usePopupMenuState';
import { mainColor } from '@sa-app/style';

import { PanelStateContext } from '@sa-app/context/PanelState';
import React from 'react';
import { AnimationMode } from './AnimationMode';
import { BattleFireInfo } from './BattleFireInfo';
import { PetBagController } from './PetBagController';

const titleName = SAConfig.getName.bind(null, 'title');
const suitName = SAConfig.getName.bind(null, 'suit');

export function GameController() {
    const [userTitle, setUserTitle] = React.useState(0);
    const [userSuit, setUserSuit] = React.useState(0);
    const [menuProps, openMenu] = usePopupMenuState<number>();

    React.useEffect(() => {
        setUserTitle(SAEngine.getUserTitle());
        setUserSuit(SAEngine.getUserSuit());
    }, []);

    const changeTitle: PopupMenuItemHandler<number> = React.useCallback(
        (item) => {
            if (item !== userTitle) {
                SAEngine.changeTitle(item);
                setUserTitle(item);
            }
        },
        [userTitle]
    );

    const changeSuit: PopupMenuItemHandler<number> = React.useCallback(
        (item) => {
            if (item !== userSuit) {
                SAEngine.changeSuit(item);
                setUserSuit(item);
            }
        },
        [userSuit]
    );

    const handleChangeTitle: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        const target = e.currentTarget;
        const titleId = await SAEngine.getUserAbilityTitles();
        const titleNames = titleId.map(titleName);
        openMenu(target, {
            data: titleId,
            displayText: titleNames as string[],
            handler: changeTitle,
        });
    };

    const handleChangeSuit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        const suitId = SAEngine.getUserAbilitySuits();
        const suitNames = suitId.map(suitName);
        openMenu(e.currentTarget, {
            data: suitId,
            displayText: suitNames as string[],
            handler: changeSuit,
        });
    };

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
                <Button variant="outlined" sx={{ m: 1 }} onClick={handleChangeSuit}>
                    {SAConfig.getName('suit', userSuit)}
                </Button>
                <Typography>{`效果: ${ItemSeXMLInfo.getSuitEff(userSuit)}`}</Typography>
            </Typography>

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                称号
                <Button variant="outlined" sx={{ m: 1 }} onClick={handleChangeTitle}>
                    {titleName(userTitle)}
                </Button>
                <Typography>{`效果: ${SAConfig.get('title', userTitle)?.abtext}`}</Typography>
            </Typography>

            <Divider />

            <PopupMenu
                id="game-controller-menu"
                sx={{
                    '& .MuiPaper-root': {
                        bgcolor: `rgba(${mainColor.front} / 18%)`,
                        backdropFilter: 'blur(4px)',
                    },
                }}
                {...menuProps}
            />
            <PetBagController />
        </>
    );
}
