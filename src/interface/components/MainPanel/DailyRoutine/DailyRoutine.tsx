import {
    Button,
    Dialog,
    DialogActions,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { Battle, Utils } from '@sa-core/index';
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
    sweep?(): Promise<void>;
    getState(): Promise<boolean>;
}

export function DailyRoutine() {
    const [open, setOpen] = React.useState(false);
    const [running, setRunning] = React.useState(false);
    const [taskModule, setTaskModule] = React.useState(<></>);
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);
    const closeHandler = () => {
        if (running) {
            Battle.Manager.strategy.custom = undefined;
            Battle.Manager.lockingTrigger = undefined;
        }
        setOpen(false);
    };
    const rows: Array<Level> = [
        {
            name: '经验训练场',
            module: <LevelExpTraining setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000571))[0];
            },
        },
        {
            name: '学习力训练场',
            module: <LevelStudyTraining setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000572))[0];
            },
        },
        {
            name: '勇者之塔',
            module: <LevelCourageTower setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000577))[0];
            },
        },
        {
            name: '泰坦矿洞',
            module: <LevelTitanHole setRunning={setRunning} running={running} />,
            async sweep() {
                await Utils.SocketSendByQueue(42395, [104, 6, 3, 0]);
            },
            async getState() {
                const [count, step] = await Utils.GetMultiValue(18724, 18725);
                return count === 2 && step === 0;
            },
        },
        // { name: '精灵王试炼'
        {
            name: 'x战队密室',
            module: <LevelXTeamRoom setRunning={setRunning} running={running} />,
            async getState() {
                return (await Utils.GetBitSet(1000585, 2000036)).some(Boolean);
            },
        },
        // { name: '作战实验室'
        // { name: '六界神王殿'
    ];

    React.useEffect(() => {
        Promise.all(rows.map((level) => level.getState())).then((r) => setTaskCompleted(r));
    }, [open, running, taskModule]);

    return (
        <>
            <Button>一键日任</Button>
            <Divider />
            <Table aria-label="daily routine table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">关卡名称</TableCell>
                        <TableCell align="center">完成状态</TableCell>
                        <TableCell align="left">操作</TableCell>
                        <TableCell align="center">配置</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow
                            key={index}
                            sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                backgroundColor: taskCompleted[index] ? `rgba(${mainColor.front}/ 18%)` : 'transparent',
                            }}
                        >
                            <TableCell component="th" scope="row" align="center">
                                {row.name}
                            </TableCell>
                            <TableCell align="center">
                                <Typography color={taskCompleted[index] ? '#eeff41' : 'inherited'}>
                                    {taskCompleted[index] ? '已完成' : '未完成'}
                                </Typography>
                            </TableCell>
                            <TableCell align="left">
                                <Button
                                    onClick={() => {
                                        setTaskModule(row.module);
                                        setOpen(true);
                                    }}
                                >
                                    启动
                                </Button>{' '}
                                {row.sweep && (
                                    <Button
                                        onClick={() => {
                                            row.sweep!()
                                                .then(() => row.getState())
                                                .then((r) => {
                                                    taskCompleted[index] = r;
                                                    setTaskCompleted([...taskCompleted]);
                                                });
                                        }}
                                    >
                                        扫荡
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell align="center"></TableCell>
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
                <DialogActions>
                    {/* {actions} */}
                    <Button onClick={closeHandler}>{running ? '终止' : '退出'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
