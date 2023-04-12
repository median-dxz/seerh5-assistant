import { Button, Checkbox, Divider, Menu, MenuItem, TableCell, Typography } from '@mui/material';

import {
    ConfigType,
    PetPosition,
    SAEngine,
    SAEntity,
    SAPetHelper,
    delay,
    lowerBlood,
    switchBag,
} from 'seerh5-assistant-core';

import { mainColor } from '@sa-app/style';

import { PanelStateContext } from '@sa-app/context/PanelState';
import React from 'react';
import { PanelTableBase, PanelTableBodyRow } from '../base';
import { AnimationMode } from './AnimationMode';
import { BattleFireInfo } from './BattleFireInfo';

const StorageKey = 'PetPattern';

interface MenuOption {
    type: 'suit' | 'title' | 'savePets' | 'setPets';
    id: number[];
    options: string[];
}

const titleName = SAEngine.getName.bind(null, ConfigType.title);
const suitName = SAEngine.getName.bind(null, ConfigType.suit);

export function PetBag() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuOption = React.useRef<MenuOption | null>(null);
    const [pets, setPets] = React.useState<SAEntity.Pet[]>([]);
    const [petsSelected, setPetsSelected] = React.useState<boolean[]>([]);
    const [petPatterns, setPetPattern] = React.useState(() => {
        let item: any[] | null | string = window.localStorage.getItem(StorageKey);
        if (!item) {
            item = Array(6);
        } else {
            item = JSON.parse(item);
        }
        return item as Array<number[]>;
    });
    const [petHeadSrc, setPetHeadSrc] = React.useState<string[]>([]);

    const [userTitle, setUserTitle] = React.useState(SAEngine.getUserTitle());
    const [userSuit, setUserSuit] = React.useState(SAEngine.getUserSuit());

    React.useEffect(() => {
        SAPetHelper.getBagPets(PetPosition.bag1).then((r) => {
            setPets(r);
            setPetsSelected(Array(r.length).fill(false));
            Promise.all(
                r.map(async (r) => {
                    const url = ClientConfig.getPetHeadPath(r.id);
                    const i = await RES.getResByUrl(url);
                    return sac.ResourceCache.get(url) ?? i.bitmapData.source?.src;
                })
            ).then((r) => {
                setPetHeadSrc(r);
            });
        });
    }, []);

    const closeMenu = () => {
        setAnchorEl(null);
        setMenuOpen(false);
    };

    const handleChangeTitle: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        setAnchorEl(e.currentTarget);
        const titleId = await SAEngine.getUserAbilityTitles();
        const titleNames = titleId.map<string>(titleName);
        menuOption.current = {
            type: 'title',
            id: titleId,
            options: titleNames,
        };
        setMenuOpen(true);
    };

    const handleChangeSuit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        setAnchorEl(e.currentTarget);
        const suitId = SAEngine.getUserAbilitySuits();
        const suitNames = suitId.map<string>(suitName);
        menuOption.current = {
            type: 'suit',
            id: suitId,
            options: suitNames,
        };
        setMenuOpen(true);
    };

    const handleSelectItem = async (index: number) => {
        const info = menuOption.current!;
        if (info.type === 'suit') {
            if (info.id[index] !== userSuit) {
                SAEngine.changeSuit(info.id[index]);
                setUserSuit(info.id[index]);
            }
        } else if (info.type === 'title') {
            SAEngine.changeTitle(info.id[index]);
            setUserTitle(info.id[index]);
        } else if (info.type === 'setPets') {
            switchBag(petPatterns[index]);
        } else if (info.type === 'savePets') {
            const newPets = await SAPetHelper.getBagPets(1);
            setPetPattern((petPatterns) => {
                const newValue = [...petPatterns];
                newValue[index] = newPets.map((pet) => pet.catchTime);
                window.localStorage.setItem(StorageKey, JSON.stringify(newValue));
                return newValue;
            });
        }
        closeMenu();
    };

    const handleLowerBlood = () => {
        const lowerBloodPets = pets.filter((pet, index) => petsSelected[index]);
        lowerBlood(lowerBloodPets.map((p) => p.catchTime));
    };

    const handleCurePets = () => {
        const curePets = pets.filter((pet, index) => petsSelected[index]);
        for (let curePet of curePets) {
            SAPetHelper.cureOnePet(curePet.catchTime);
        }
    };

    const handleSwitchPetPattern: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        setAnchorEl(e.currentTarget);
        const patternName = Array(petPatterns.length)
            .fill('')
            .map(
                (v, index) =>
                    `方案${index}: ${(
                        petPatterns[index]?.map(Number).map((ct) => {
                            let name = PetManager.getPetInfo(ct)?.name;
                            if (!name) {
                                name = PetStorage2015InfoManager.allInfo.find((p) => p.catchTime === ct)!.name;
                            }
                            return name;
                        }) ?? []
                    ).join(',')}`
            );
        menuOption.current = {
            type: 'setPets',
            id: Array(petPatterns.length)
                .fill(0)
                .map((v, index) => index),
            options: patternName,
        };
        setMenuOpen(true);
    };

    const handleSavePetPattern: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        setAnchorEl(e.currentTarget);
        const patternName = Array(petPatterns.length)
            .fill('')
            .map((v, index) => `方案${index}`);
        menuOption.current = {
            type: 'savePets',
            id: Array(petPatterns.length)
                .fill(0)
                .map((v, index) => index),
            options: patternName,
        };
        setMenuOpen(true);
    };

    const handleOpenPetItemUseProp = async (ct: number) => {
        await ModuleManager.showModule('petBag');
        const petBagModule = SAEngine.SeerModuleHelper.currentModule<petBag.PetBag>();
        const petBagPanel = petBagModule.currentPanel!;
        await delay(300);
        petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
        await delay(300);
        petBagPanel.showDevelopBaseView();
        petBagPanel.showDevelopView(9);
    };

    const handleCopyCatchTime = () => {
        navigator.clipboard.writeText(
            JSON.stringify(pets.map((pet) => ({ name: pet.name, catchTime: pet.catchTime })))
        );
        BubblerManager.getInstance().showText('复制成功');
    };

    const { setOpen } = React.useContext(PanelStateContext);
    const openPetBag = React.useCallback(() => {
        ModuleManager.showModule('petBag');
        setOpen(false);
    }, [setOpen]);

    return (
        <>
            <Button onClick={openPetBag}>打开背包界面</Button>
            <Button onClick={SAPetHelper.cureAllPet}>全体治疗</Button>
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
                    {SAEngine.getName(ConfigType.suit, userSuit)}
                </Button>
                <Typography>{`效果: ${ItemSeXMLInfo.getSuitEff(userSuit)}`}</Typography>
            </Typography>

            <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']}>
                称号
                <Button variant="outlined" sx={{ m: 1 }} onClick={handleChangeTitle}>
                    {titleName(userTitle)}
                </Button>
                <Typography>{`效果: ${SAEngine.get(ConfigType.title, userTitle)?.abtext}`}</Typography>
            </Typography>

            <Divider />
            <Menu
                id="suit-select-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={closeMenu}
                MenuListProps={{
                    role: 'listbox',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        bgcolor: `rgba(${mainColor.front} / 18%)`,
                        backdropFilter: 'blur(4px)',
                    },
                }}
            >
                {menuOption.current?.options.map((option, index) => (
                    <MenuItem
                        key={option}
                        onClick={() => {
                            handleSelectItem(index);
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>

            <h3>精灵背包</h3>
            <Button onClick={handleLowerBlood}>压血</Button>
            <Button onClick={handleCurePets}>治疗</Button>
            <Button onClick={handleCopyCatchTime}>复制catchTime</Button>
            <Button onClick={handleSwitchPetPattern}>更换方案</Button>
            <Button onClick={handleSavePetPattern}>保存方案</Button>

            <PanelTableBase
                aria-label="pet list"
                size="small"
                heads={
                    <>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">id</TableCell>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">名称</TableCell>
                        <TableCell align="center">血量</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </>
                }
            >
                {pets.map((row, index) => (
                    <PanelTableBodyRow key={row.id}>
                        <TableCell align="center">
                            <Checkbox
                                color="primary"
                                checked={petsSelected[index]}
                                onChange={(event) => {
                                    petsSelected.splice(index, 1, event.target.checked);
                                    setPetsSelected([...petsSelected]);
                                }}
                            />
                        </TableCell>
                        <TableCell component="th" scope="row" align="center">
                            {row.id}
                        </TableCell>
                        <TableCell align="center">
                            <img crossOrigin="anonymous" src={petHeadSrc[index]} width={48}></img>
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">
                            {row.hp} / {row.maxHp}
                        </TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    handleOpenPetItemUseProp(row.catchTime);
                                }}
                            >
                                道具
                            </Button>
                            <Button
                                onClick={() => {
                                    SAPetHelper.cureOnePet(row.catchTime);
                                }}
                            >
                                治疗
                            </Button>
                        </TableCell>
                    </PanelTableBodyRow>
                ))}
            </PanelTableBase>
        </>
    );
}
