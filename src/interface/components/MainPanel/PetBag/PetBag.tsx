import {
    Button,
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
import { mainColor } from '@sa-ui/style';
import Pet from '@sa-core/entities/pet';
import React from 'react';

const numberFormat = Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
});

interface MenuOption {
    type: 'suit' | 'title' | 'pets';
    id: number[];
    options: string[];
}

export function PetBag() {
    const { Utils, PetHelper, Functions, Const } = SA;
    type BattleFireInfo = Awaited<ReturnType<typeof Functions.updateBattleFireInfo>>;
    const [battleFire, setBattleFire] = React.useState<BattleFireInfo>({ timeLeft: 0, type: 0, valid: false });
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [timer, setTimer] = React.useState<undefined | number>(undefined);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuOption = React.useRef<MenuOption | null>(null);
    const [pets, setPets] = React.useState<Pet[]>([]);
    const [petsCombination, setPetsCombination] = React.useState<string[]>([]);

    const updateBattleFire = async () => {
        const info = await Functions.updateBattleFireInfo();
        setBattleFire(info);
        setTimeLeft(info.timeLeft);
        return info;
    };

    React.useEffect(() => {
        updateBattleFire();
        PetHelper.getBagPets(Const.PET_POS.bag1).then(setPets);
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

    return (
        <>
            <Button
                onClick={() => {
                    ModuleManager.showModule('petBag');
                }}
            >
                打开背包界面
            </Button>
            <Button onClick={PetHelper.cureAllPet}>全体治疗</Button>
            <Divider />
            <h3>火焰信息</h3>
            <Typography
                color={
                    !battleFire.valid
                        ? 'inherit'
                        : battleFire.type === Const.BATTLE_FIRE.绿火
                        ? 'green'
                        : battleFire.type === Const.BATTLE_FIRE.金火
                        ? 'gold'
                        : 'inherit'
                }
            >
                {!battleFire.valid
                    ? '无火焰'
                    : battleFire.type === Const.BATTLE_FIRE.绿火
                    ? '使用中: 绿火'
                    : battleFire.type === Const.BATTLE_FIRE.金火
                    ? '使用中: 金火'
                    : '其他火焰'}{' '}
                {battleFire.valid &&
                    `剩余时间: ${numberFormat.format(Math.trunc(timeLeft / 60))}:${numberFormat.format(timeLeft % 60)}`}
                <Button onClick={updateBattleFire}>刷新</Button>
            </Typography>
            <Divider />
            <h3>套装 / 称号</h3>
            <Typography display="flex" alignItems="baseline">
                当前套装:
                <Button
                    onClick={(e) => {
                        const suitId = Utils.UserAbilitySuits();
                        const suitName = suitId.map<string>(SuitXMLInfo.getName.bind(SuitXMLInfo));
                        menuOption.current = {
                            type: 'title',
                            id: suitId,
                            options: suitName,
                        };
                        setAnchorEl(e.currentTarget);
                        setMenuOpen(true);
                    }}
                >
                    {SuitXMLInfo.getName(Utils.UserSuit())}
                </Button>
                效果: {ItemSeXMLInfo.getSuitEff(Utils.UserSuit())}
            </Typography>

            <Typography display="flex" alignItems="baseline">
                当前称号:
                <Button
                    onClick={async (e) => {
                        setAnchorEl(e.currentTarget);
                        const titleId = await Utils.UserAbilityTitles();
                        const titleName = titleId.map<string>(AchieveXMLInfo.getTitle.bind(AchieveXMLInfo));
                        menuOption.current = {
                            type: 'title',
                            id: titleId,
                            options: titleName,
                        };
                        setMenuOpen(true);
                    }}
                >
                    {AchieveXMLInfo.getTitle(Utils.UserTitle())}
                </Button>
                效果: {AchieveXMLInfo.getTitleEffDesc(Utils.UserTitle())}
            </Typography>
            <Menu
                id="suit-select-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => {
                    setAnchorEl(null);
                    setMenuOpen(false);
                }}
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
                {menuOption.current!.options.map((option, index) => (
                    <MenuItem
                        key={option}
                        onClick={(e) => {
                            const info = menuOption.current!;
                            if (info.type === 'suit') {
                                Utils.ChangeSuit(info.id[index]);
                            } else if (info.type === 'title') {
                                Utils.ChangeTitle(info.id[index]);
                            } else if (info.type === 'pets') {
                               
                            }
                            setAnchorEl(null);
                            setMenuOpen(false);
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>

            <Divider />
            <h3>精灵背包</h3>
            <Button>压血</Button>
            <Button>治疗</Button>
            <Button>更换方案</Button>
            <Button>保存方案</Button>

            <Table size="small">
                <TableHead>
                    <TableRow>
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
                            <TableCell component="th" scope="row" align="center">
                                {row.id}
                            </TableCell>
                            <TableCell align="center">这里显示头像</TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">
                                {row.hp} / {row.maxHp}
                            </TableCell>
                            <TableCell align="center">
                                <Button>打开道具使用页面</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
