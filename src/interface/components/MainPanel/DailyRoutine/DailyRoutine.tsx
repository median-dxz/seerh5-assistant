import { Button, Dialog, DialogActions, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { BattleModule } from '@sa-core/index';
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

export function DailyRoutine() {
    const [config, setConfig] = React.useState<Array<any>>([]);
    const [open, setOpen] = React.useState(false);
    const [running, setRunning] = React.useState(false);
    const [taskModule, setTaskModule] = React.useState(<></>);
    const closeHandler = () => {
        if (running) {
            BattleModule.Manager.strategy.custom = undefined;
            BattleModule.Manager.lockingTrigger = undefined;
        }
        setOpen(false);
    };
    const rows: Array<Level> = [
        {
            name: '经验训练场',
            module: <LevelExpTraining setRunning={setRunning} running={running} />,
        },
        {
            name: '学习力训练场',
            module: <LevelStudyTraining setRunning={setRunning} running={running} />,
        },
        {
            name: '勇者之塔',
            module: <LevelCourageTower setRunning={setRunning} running={running} />,
        },
        {
            name: '泰坦矿洞',
            module: <LevelTitanHole setRunning={setRunning} running={running} />,
        },
        // { name: '精灵王试炼'
        {
            name: 'x战队密室',
            module: <LevelXTeamRoom setRunning={setRunning} running={running} />,
        },
        // { name: '作战实验室'
        // { name: '六界神王殿'
    ];

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
                            <TableCell align="center"></TableCell>
                            <TableCell align="center">
                                <Button disabled={false}>扫荡</Button>
                                <Button
                                    onClick={() => {
                                        setTaskModule(row.module);
                                        setOpen(true);
                                    }}
                                >
                                    启动
                                </Button>
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
