import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import useSWR from 'swr';

import { PanelField, useIndex, useRowData } from '@/components/PanelTable';
import { PanelTable, type PanelColumns } from '@/components/PanelTable/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { MOD_SCOPE_BUILTIN } from '@/constants';
import { useModStore } from '@/context/useModStore';
import { useTaskScheduler } from '@/context/useTaskScheduler';
import { LevelAction } from '@sea/core';
import type { Task } from '@sea/mod-type';
import { produce } from 'immer';

// import * as Endpoints from '@/service/endpoints';

// const rows: Array<Level> = React.useMemo(
//     () => [
//         {
//             name: '泰坦矿洞',
//             module: <LevelTitanHole setRunning={setRunning} running={running} />,
//             async sweep() {
//                 await socket.sendByQueue(42395, [104, 6, 3, 0]);
//             },
//             async getState() {
//                 const [count, step] = await socket.multiValue(18724, 18725);
//                 return count === 2 && step === 0;
//             },
//         },
//         // { name: '作战实验室'
//         {
//             name: '六界神王殿',
//             async sweep() {
//                 await socket.sendByQueue(45767, [38, 3]);
//                 return;
//             },
//             async getState() {
//                 let state = true;
//                 const values = await socket.multiValue(11411, 11412, 11413, 11414);
//                 for (let i = 1; i <= 7; i++) {
//                     const group = Math.trunc((i - 1) / 2);
//                     const v = [values[group] & ((1 << 16) - 1), values[group] >> 16];
//                     // console.log(v[(i - 1) % 2] & 15);
//                     if ((v[(i - 1) % 2] & 15) < 3) {
//                         state = false;
//                         break;
//                     }
//                 }
//                 return state;
//             },
//         },
//     ],
//     [running]
// );

type Row = {
    taskClass: Task;
    config?: Record<string, unknown>;
};

export function CommonLevelPanel() {
    const { taskStore: levelStore } = useModStore();
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const {
        data: rows = [],
        isLoading,
        error
    } = useSWR('ds://configs/level', async () => {
        const r: Row[] = [];
        levelStore.forEach((levelInstance) => {
            if (levelInstance.ownerMod === `${MOD_SCOPE_BUILTIN}::PetFragmentLevel`) {
                return;
            }
            if (Object.hasOwn(levelInstance.task.prototype, 'selectLevelBattle')) {
                r.push({ taskClass: levelInstance.task });
            }
        });

        return r;
    });

    const col: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '关卡名称'
            },
            {
                field: 'state',
                columnName: '完成状态'
            },
            {
                field: 'action',
                columnName: '操作'
            },
            {
                field: 'config',
                columnName: '配置'
            }
        ],
        []
    );

    const toRowKey = useCallback((row: Row) => row.taskClass.meta.name, []);

    if (isLoading)
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mx: 2 }}>加载数据中</Typography>
                <CircularProgress />
            </Box>
        );

    if (error) {
        console.error(error);
        return <Typography fontFamily={['Open Sans']}>{String(error)}</Typography>;
    }

    return (
        <>
            <Button>一键日任</Button>
            <PanelTable
                data={rows}
                toRowKey={toRowKey}
                columns={col}
                rowElement={<PanelRow taskCompleted={taskCompleted} setTaskCompleted={setTaskCompleted} />}
            />
        </>
    );
}

interface PanelRowProps {
    taskCompleted: boolean[];
    setTaskCompleted: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const PanelRow = React.memo(({ taskCompleted, setTaskCompleted }: PanelRowProps) => {
    const { enqueue } = useTaskScheduler();
    const { config, taskClass: levelClass } = useRowData<Row>();
    const runner = React.useMemo(() => new levelClass(config), [levelClass, config]);
    const index = useIndex();
    const completed = taskCompleted[index];

    runner.next = new Proxy(runner.next.bind(runner), {
        apply(target, thisArg, argArray) {
            const r = Reflect.apply(target, thisArg, argArray);
            setTaskCompleted(
                produce((draft) => {
                    draft[index] = r === LevelAction.STOP;
                })
            );
            return r;
        }
    });

    useEffect(() => {
        runner.update().then(() => runner.next());
    }, [runner]);

    return (
        <SeaTableRow>
            <PanelField field="name">{levelClass.meta.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action">
                <Box component="span">
                    <Button
                        onClick={() => {
                            enqueue(runner);
                        }}
                        disabled={completed}
                    >
                        启动
                    </Button>
                </Box>
            </PanelField>
            <PanelField field="config">
                {typeof config === 'object' && 'sweep' in config && (
                    <Typography>扫荡: {config.sweep ? '开启' : '关闭'}</Typography>
                )}
            </PanelField>
        </SeaTableRow>
    );
});
