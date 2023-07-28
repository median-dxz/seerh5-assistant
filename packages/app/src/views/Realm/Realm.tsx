import { Button, Dialog, DialogActions, Divider, Typography, alpha } from '@mui/material';
import { PanelField, PanelTable, useIndex, useRowData, type PanelColumns } from '@sa-app/components/PanelTable';
import { SAContext } from '@sa-app/context/SAContext';
import React, { useCallback } from 'react';
import { LevelTitanHole } from './LevelTitanHole';
import { LevelXTeamRoom } from './LevelXTeamRoom';

import { SaTableRow } from '@sa-app/components/styled/TableRow';
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

    return (
        <>
            <Button>一键日任</Button>
            <Divider />
            <PanelTable
                data={rows}
                toRowKey={toRowKey}
                columns={col}
                rowElement={
                    <PanelRow
                        taskCompleted={taskCompleted}
                        openTask={(index) => {
                            setOpen(true);
                            setTaskModule(index);
                        }}
                        sweepTask={(index) => {
                            rows[index].getState().then((r) =>
                                setTaskCompleted(
                                    produce((draft) => {
                                        draft[index] = r;
                                    })
                                )
                            );
                        }}
                    />
                }
            />
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

interface PanelRowProps {
    taskCompleted: boolean[];
    openTask: (index: number) => void;
    sweepTask: (index: number) => void;
}

const PanelRow = ({ taskCompleted, openTask, sweepTask }: PanelRowProps) => {
    const row = useRowData<Level>();
    const index = useIndex();
    const completed = taskCompleted[index];

    return (
        <SaTableRow
            sx={{
                backgroundColor: (theme) => (completed ? `${alpha(theme.palette.primary.main, 0.18)}` : 'transparent'),
            }}
        >
            <PanelField field="name">{row.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {row.module && (
                    <Button
                        onClick={() => {
                            openTask(index);
                        }}
                    >
                        启动
                    </Button>
                )}
                {row.sweep && (
                    <Button
                        onClick={() => {
                            row.sweep!().then(() => sweepTask(index));
                        }}
                    >
                        扫荡
                    </Button>
                )}
            </PanelField>
        </SaTableRow>
    );
};
