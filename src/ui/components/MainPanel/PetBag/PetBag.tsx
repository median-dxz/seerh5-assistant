import {
    Button,
    Checkbox,
    Divider,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { delay } from '@sa-core/common';
import Pet from '@sa-core/entities/pet';
import { SeerModuleHelper } from '@sa-core/utils/module-helper';
import { PanelState } from '@sa-ui/context/PanelState';
import { mainColor } from '@sa-ui/style';
import React from 'react';

const numberFormatter = (n: number) => {
    const { format } = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    });
    return `${format(Math.trunc(n / 60))}:${format(n % 60)}`;
};

const StorageKey = 'PetPattern';

interface MenuOption {
    type: 'suit' | 'title' | 'savePets' | 'setPets';
    id: number[];
    options: string[];
}

interface Props {
    panelState: PanelState;
}

export function PetBag(props: Props) {
    const { Utils, PetHelper, Functions, Const } = SA;
    const { panelState } = props;
    type BattleFireInfo = Awaited<ReturnType<typeof Functions.updateBattleFireInfo>>;
    const [battleFire, setBattleFire] = React.useState<BattleFireInfo>({ timeLeft: 0, type: 0, valid: false });
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [timer, setTimer] = React.useState<undefined | number>(undefined);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuOption = React.useRef<MenuOption | null>(null);
    const [pets, setPets] = React.useState<Pet[]>([]);
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
    const [userTitle, setUserTitle] = React.useState(Utils.UserTitle());
    const [userSuit, setUserSuit] = React.useState(Utils.UserSuit());

    const updateBattleFire = async () => {
        const info = await Functions.updateBattleFireInfo();
        setBattleFire(info);
        setTimeLeft(info.timeLeft);
        return info;
    };

    React.useEffect(() => {
        updateBattleFire();
        PetHelper.getBagPets(Const.PET_POS.bag1).then((r) => {
            setPets(r);
            setPetsSelected(Array(r.length).fill(false));
            let promises = r
                .map((r) => r.id)
                .map(async (id) => {
                    const url = ClientConfig.getPetHeadPath(id);
                    const i = await RES.getResByUrl(url);
                    const src: string = i.bitmapData.source.src;
                    return src ?? window.SAResourceMap.get(url);
                });
            Promise.all(promises).then((r) => {
                setPetHeadSrc(r);
            });
        });
    }, []);

    React.useEffect(() => {
        if (battleFire.timeLeft <= 0 || battleFire.valid === false) {
            clearInterval(timer);
            setTimer(undefined);
        } else {
            if (window) {
                const { setInterval } = window;
                clearInterval(timer);
                setTimer(
                    setInterval(() => {
                        if (timeLeft <= 0) {
                            updateBattleFire();
                        } else {
                            setTimeLeft((t) => t - 1);
                        }
                    }, 1000)
                );
            }
        }
        return () => clearInterval(timer);
    }, [battleFire]);

    const openPetBag = () => {
        ModuleManager.showModule('petBag');
        panelState.setOpen(false);
    };

    const exchangeBattleFire = () => {
        ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        panelState.setOpen(false);
    };

    const handleChangeSuit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        const suitId = Utils.UserAbilitySuits();
        const suitName = suitId.map<string>(SuitXMLInfo.getName.bind(SuitXMLInfo));
        menuOption.current = {
            type: 'suit',
            id: suitId,
            options: suitName,
        };
        setAnchorEl(e.currentTarget);
        setMenuOpen(true);
    };

    const handleChangeTitle: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        setAnchorEl(e.currentTarget);
        const titleId = await Utils.UserAbilityTitles();
        const titleName = titleId.map<string>(AchieveXMLInfo.getTitle.bind(AchieveXMLInfo));
        menuOption.current = {
            type: 'title',
            id: titleId,
            options: titleName,
        };
        setMenuOpen(true);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuOpen(false);
    };

    const handleSelectItem = async (index: number) => {
        const info = menuOption.current!;
        if (info.type === 'suit') {
            Utils.ChangeSuit(info.id[index]);
            setUserSuit(info.id[index]);
        } else if (info.type === 'title') {
            Utils.ChangeTitle(info.id[index]);
            setUserTitle(info.id[index]);
        } else if (info.type === 'setPets') {
            Functions.switchBag(petPatterns[index]);
        } else if (info.type === 'savePets') {
            const newPets = await PetHelper.getBagPets(1);
            setPetPattern((petPatterns) => {
                const newValue = [...petPatterns];
                newValue[index] = newPets.map((pet) => pet.catchTime);
                window.localStorage.setItem(StorageKey, JSON.stringify(newValue));
                return newValue;
            });
        }
        handleCloseMenu();
    };

    const handleLowerBlood = () => {
        const curePets = pets.filter((pet, index) => petsSelected[index]).map((r) => r.catchTime);
        for (let curePet of curePets) {
            PetHelper.cureOnePet(curePet);
        }
    };

    const handleCurePets = () => {
        const curePets = pets.filter((pet, index) => petsSelected[index]).map((r) => r.catchTime);
        for (let curePet of curePets) {
            PetHelper.cureOnePet(curePet);
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
        const petBagModule = SeerModuleHelper.currentModule<petBag.PetBag>();
        const petBagPanel = petBagModule.currentPanel!;
        await delay(300);
        petBagPanel.onSelectPet({ data: PetManager.getPetInfo(ct) });
        await delay(300);
        petBagPanel.showDevelopBaseView();
        petBagPanel.showDevelopView(9);
    };

    let fireRenderProps: { color: string; text: string };
    if (!battleFire.valid) {
        fireRenderProps = { color: 'inherit', text: '无火焰' };
    } else {
        if (battleFire.type === Const.BATTLE_FIRE.绿火) {
            fireRenderProps = { color: 'green', text: '使用中: 绿火' };
        } else if (battleFire.type === Const.BATTLE_FIRE.金火) {
            fireRenderProps = { color: 'gold', text: '使用中: 金火' };
        } else {
            fireRenderProps = { color: 'inherit', text: '其他火焰' };
        }
        fireRenderProps.text += `剩余时间: ${numberFormatter(timeLeft)}`;
    }

    return (
        <>
            <Button onClick={openPetBag}>打开背包界面</Button>
            <Button onClick={PetHelper.cureAllPet}>全体治疗</Button>
            <Divider />
            <h3>火焰信息</h3>
            <Typography color={fireRenderProps.color}>
                {fireRenderProps.text}
                <Button onClick={updateBattleFire}>刷新</Button>
                <Button onClick={exchangeBattleFire}>兑换</Button>
            </Typography>
            <Divider />
            <h3>套装 / 称号</h3>
            <Typography display="flex" alignItems="baseline">
                当前套装:
                <Button onClick={handleChangeSuit}>{SuitXMLInfo.getName(userSuit)}</Button>
                效果: {ItemSeXMLInfo.getSuitEff(userSuit)}
            </Typography>

            <Typography display="flex" alignItems="baseline">
                当前称号:
                <Button onClick={handleChangeTitle}>{AchieveXMLInfo.getTitle(userTitle)}</Button>
                效果: {AchieveXMLInfo.getTitleEffDesc(userTitle)}
            </Typography>
            <Menu
                id="suit-select-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
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

            <Divider />
            <h3>精灵背包</h3>
            <Button onClick={handleLowerBlood}>压血</Button>
            <Button onClick={handleCurePets}>治疗</Button>
            <Button
                onClick={() => {
                    console.log(pets.map((pet) => ({ name: pet.name, catchTime: pet.catchTime })));
                }}
            >
                复制catchTime
            </Button>
            <Button onClick={handleSwitchPetPattern}>更换方案</Button>
            <Button onClick={handleSavePetPattern}>保存方案</Button>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">id</TableCell>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">名称</TableCell>
                        <TableCell align="center">血量</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pets.map((row, index) => (
                        <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                                        PetHelper.cureOnePet(row.catchTime);
                                    }}
                                >
                                    治疗
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
