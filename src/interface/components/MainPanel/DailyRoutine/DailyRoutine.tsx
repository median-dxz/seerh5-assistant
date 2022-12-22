import { Button, Dialog, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { mainColor } from '@sa-ui/style';
import React from 'react';
import { LevelCourageTower } from './LevelCourageTower';
import { LevelExpTraining } from './LevelExpTraining';
import { LevelStudyTraining } from './LevelStudyTraining';
import { LevelTitanHole } from './LevelTitanHole';
import { LevelXTeamRoom } from './LevelXTeamRoom';

interface Level {
    name: string;
    module: JSX.Element;
}

const rows: Array<Level> = [
    {
        name: '经验训练场',
        module: <></>,
    },
    {
        name: '学习力训练场',
        module: <></>,
    },
    {
        name: '勇者之塔',
        module: <></>,
    },
    {
        name: '泰坦矿洞',
        module: <></>,
    },
    // { name: '精灵王试炼'
    {
        name: 'x战队密室',
        module: <></>,
    },
    // { name: '作战实验室'
    // { name: '六界神王殿'
];

export function DailyRoutine() {
    const [config, setConfig] = React.useState<Array<any>>([]);
    const [open, setOpen] = React.useState(false);
    const [taskModule, setTaskModule] = React.useState(<></>);
    const commonCloseHandler = (running: boolean) => {
        if (running) {
            SA.BattleModule.Manager.strategy.custom = undefined;
            SA.BattleModule.Manager.lockingTrigger = undefined;
        }
        setOpen(false);
    };
    // React.useEffect(() => {}, []);
    return (
        <>
            <Table aria-label="daily routine table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">关卡名称</TableCell>
                        <TableCell align="center">完成状态</TableCell>
                        <TableCell align="center">操作</TableCell>
                        <TableCell align="center">配置</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" align="center">
                                {row.name}
                            </TableCell>
                            <TableCell align="center">
                                {config[index]?.completed} / {config[index]?.total}
                                <LinearProgress
                                    color="inherit"
                                    variant="determinate"
                                    value={((config[index]?.completed ?? 0) / (config[index]?.total ?? 1)) * 100}
                                />
                            </TableCell>
                            <TableCell align="center"></TableCell>
                            <TableCell align="center">
                                <Button onClick={async () => {}}>启动</Button>
                                <Button onClick={() => {}} disabled={false}>
                                    扫荡
                                </Button>
                                <Button
                                    onClick={() => {
                                        switch (row.name) {
                                            case 'x战队密室':
                                                setTaskModule(<LevelXTeamRoom closeHandler={commonCloseHandler} />);
                                                break;
                                            case '经验训练场':
                                                setTaskModule(<LevelExpTraining closeHandler={commonCloseHandler} />);
                                                break;
                                            case '学习力训练场':
                                                setTaskModule(<LevelStudyTraining closeHandler={commonCloseHandler} />);
                                                break;
                                            case '勇者之塔':
                                                setTaskModule(<LevelCourageTower closeHandler={commonCloseHandler} />);
                                                break;
                                            case '泰坦矿洞':
                                                setTaskModule(<LevelTitanHole closeHandler={commonCloseHandler} />);
                                                break;
                                            default:
                                                break;
                                        }
                                        setOpen(true);
                                    }}
                                >
                                    启动
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog
                open={open}
                sx={{
                    '& .MuiDialog-paper': {
                        minWidth: 384,
                        bgcolor: `rgba(${mainColor.front} / 18%)`,
                        backdropFilter: 'blur(4px)',
                    },
                }}
            >
                {taskModule}
            </Dialog>
        </>
    );
}
