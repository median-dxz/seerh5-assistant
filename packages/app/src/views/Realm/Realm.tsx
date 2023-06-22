import { Button, Dialog, DialogActions, Divider, Typography, alpha } from '@mui/material';
import { SAContext } from '@sa-app/context/SAContext';
import React, { useCallback } from 'react';
import { PanelColumnRender, PanelColumns, PanelTable } from '../../components/PanelTable/PanelTable';
import { LevelCourageTower } from './LevelCourageTower';
import { LevelElfKingsTrial } from './LevelElfKingsTrial';
import { LevelExpTraining } from './LevelExpTraining';
import { LevelStudyTraining } from './LevelStudyTraining';
import { LevelTitanHole } from './LevelTitanHole';
import { LevelXTeamRoom } from './LevelXTeamRoom';

import { saTheme } from '@sa-app/style';
import { produce } from 'immer';
import * as SABattle from 'sa-core/battle';
import * as SAEngine from 'sa-core/engine';

interface Level {
    name: string;
    module?: JSX.Element;
    sweep?(): Promise<void>;
    getState(): Promise<boolean>;
}

export function Realm() {
    const [open, setOpen] = React.useState(false);
    const [running, setRunning] = React.useState(false);
    const [taskModule, setTaskModule] = React.useState<null | number>(null);
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const { Battle: battleContext } = React.useContext(SAContext);
    const [battleAuto, setBattleAuto] = [battleContext.enableAuto, battleContext.updateAuto];

    let taskModuleComponent = <></>;

    const closeHandler = () => {
        if (battleContext.enableAuto) {
            SABattle.Manager.clear();
            setBattleAuto(false);
        }
        setRunning(false);
        setOpen(false);
    };

    const rows: Array<Level> = React.useMemo(
        () => [
            {
                name: '经验训练场',
                module: <LevelExpTraining setRunning={setRunning} running={running} />,
                async getState() {
                    return (await SAEngine.Socket.bitSet(1000571))[0];
                },
            },
            {
                name: '学习力训练场',
                module: <LevelStudyTraining setRunning={setRunning} running={running} />,
                async getState() {
                    return (await SAEngine.Socket.bitSet(1000572))[0];
                },
            },
            {
                name: '勇者之塔',
                module: <LevelCourageTower setRunning={setRunning} running={running} />,
                async getState() {
                    return (await SAEngine.Socket.bitSet(1000577))[0];
                },
            },
            {
                name: '泰坦矿洞',
                module: <LevelTitanHole setRunning={setRunning} running={running} />,
                async sweep() {
                    await SAEngine.Socket.sendByQueue(42395, [104, 6, 3, 0]);
                },
                async getState() {
                    const [count, step] = await SAEngine.Socket.multiValue(18724, 18725);
                    return count === 2 && step === 0;
                },
            },
            {
                name: '精灵王试炼',
                module: <LevelElfKingsTrial setRunning={setRunning} running={running} />,
                async getState() {
                    const [count, weeklyCount] = await SAEngine.Socket.multiValue(18745, 20134);
                    const [rewardClosed] = await SAEngine.Socket.bitSet(2000037);
                    return count === 6 || (weeklyCount >= 30 && rewardClosed);
                },
            },
            {
                name: 'x战队密室',
                module: <LevelXTeamRoom setRunning={setRunning} running={running} />,
                async getState() {
                    return (await SAEngine.Socket.bitSet(1000585, 2000036)).some(Boolean);
                },
            },
            // { name: '作战实验室'
            {
                name: '六界神王殿',
                async sweep() {
                    await SAEngine.Socket.sendByQueue(45767, [38, 3]);
                    return;
                },
                async getState() {
                    let state = true;
                    const values = await SAEngine.Socket.multiValue(11411, 11412, 11413, 11414);
                    for (let i = 1; i <= 7; i++) {
                        const group = Math.trunc((i - 1) / 2);
                        const v = [values[group] & ((1 << 16) - 1), values[group] >> 16];
                        // console.log(v[(i - 1) % 2] & 15);
                        if ((v[(i - 1) % 2] & 15) < 3) {
                            state = false;
                            break;
                        }
                    }
                    return state;
                },
            },
        ],
        [running]
    );

    React.useEffect(() => {
        Promise.all(rows.map((level) => level.getState())).then((r) => setTaskCompleted(r));
    }, [rows]);

    if (taskModule != null && Object.hasOwn(rows[taskModule], 'module')) {
        taskModuleComponent = rows[taskModule].module!;
    }

    const render: PanelColumnRender<Level> = useCallback(
        (row, index) => ({
            name: row.name,
            state: (
                <Typography color={taskCompleted[index] ? '#eeff41' : 'inherited'}>
                    {taskCompleted[index] ? '已完成' : '未完成'}
                </Typography>
            ),
            action: (
                <>
                    {row.module && (
                        <Button
                            onClick={() => {
                                setTaskModule(index);
                                setOpen(true);
                            }}
                        >
                            启动
                        </Button>
                    )}
                    {row.sweep && (
                        <Button
                            onClick={() => {
                                row.sweep!()
                                    .then(() => row.getState())
                                    .then((r) => {
                                        setTaskCompleted(
                                            produce((draft) => {
                                                draft[index] = r;
                                            })
                                        );
                                    });
                            }}
                        >
                            扫荡
                        </Button>
                    )}
                </>
            ),
        }),
        [taskCompleted]
    );

    const col: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '关卡名称',
            },
            {
                field: 'state',
                columnName: '完成状态',
            },
            {
                field: 'action',
                columnName: '操作',
            },
            {
                field: 'config',
                columnName: '配置',
            },
        ],
        []
    );

    const toRowKey = useCallback((row: Level) => row.name, []);

    const rowProps = useCallback(
        (row: Level, index: number) => ({
            sx: {
                backgroundColor: taskCompleted[index] ? `${alpha(saTheme.palette.primary.main, 0.18)}` : 'transparent',
            },
        }),
        [taskCompleted]
    );

    return (
        <>
            <Button>一键日任</Button>
            <Divider />
            <PanelTable data={rows} toRowKey={toRowKey} columns={col} columnRender={render} rowProps={rowProps} />
            <Dialog
                open={open}
                sx={{
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '& .MuiDialog-paper': {
                        minWidth: 384,
                    },
                }}
            >
                {taskModuleComponent}
                <DialogActions>
                    {/* {actions} */}
                    <Button onClick={closeHandler}>{battleAuto ? '终止' : '退出'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
