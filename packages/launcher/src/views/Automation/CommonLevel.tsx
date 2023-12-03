import { Box, Button, CircularProgress, Dialog, DialogActions, Divider, Typography, alpha } from '@mui/material';
import React, { useCallback, useState } from 'react';
import useSWR from 'swr';

import { PanelField, useIndex, useRowData } from '@/components/PanelTable';
import { PanelTable, type PanelColumns } from '@/components/PanelTable/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { MOD_SCOPE_BUILTIN } from '@/constants';
import { useModStore } from '@/context/useModStore';
import * as Endpoints from '@/service/endpoints';
import { theme } from '@/style';
import { produce } from 'immer';
import { LevelAction, type ILevelRunner } from 'sea-core';
import { LevelBaseNew } from './LevelBaseNew';

// const rows: Array<Level> = React.useMemo(
//     () => [
//         {
//             name: '泰坦矿洞',
//             module: <LevelTitanHole setRunning={setRunning} running={running} />,
//             async sweep() {
//                 await Socket.sendByQueue(42395, [104, 6, 3, 0]);
//             },
//             async getState() {
//                 const [count, step] = await Socket.multiValue(18724, 18725);
//                 return count === 2 && step === 0;
//             },
//         },
//         // { name: '作战实验室'
//         {
//             name: '六界神王殿',
//             async sweep() {
//                 await Socket.sendByQueue(45767, [38, 3]);
//                 return;
//             },
//             async getState() {
//                 let state = true;
//                 const values = await Socket.multiValue(11411, 11412, 11413, 11414);
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

// levelConfigs.forEach((config, index) => {
//     const levelUpdater = runner.updater.bind(runner);
//     runner.updater = async () => {
//         const r = await levelUpdater();
//         setTaskCompleted(
//             produce((draft) => {
//                 draft[index] = r === LevelState.STOP;
//             })
//         );
//         return r;
//     };
// });

type Row = {
    levelClass: SEAL.Level;
    config: Record<string, unknown>;
};

export function CommonLevelPanel() {
    const { store, levelStore } = useModStore();
    const [runner, setRunner] = useState<null | ILevelRunner>(null);
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const open = Boolean(runner);

    const closeHandler = () => {
        setRunner(null);
    };

    const {
        data: rows = [],
        isLoading,
        error,
    } = useSWR('ds://configs/level', async () => {
        const r: Row[] = [];
        const mods = Array.from(store.values()).filter(
            (mod) => mod.level.length > 0 && mod.meta.namespace !== `${MOD_SCOPE_BUILTIN}::PetFragmentLevel`
        );
        const allConfigs = await Promise.all(
            mods.map(({ meta }) => Endpoints.getModConfig(meta.scope, meta.id) as Promise<Record<string, unknown>>)
        );
        allConfigs.forEach((config) => {
            Object.entries(config).forEach(([key, value]) => {
                if (levelStore.has(key)) {
                    const levelInstance = levelStore.get(key)!;
                    r.push({ levelClass: levelInstance.level, config: value as Record<string, unknown> });
                }
            });
        });
        return r;
    });

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

    const toRowKey = useCallback((row: Row) => row.levelClass.meta.name, []);

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
            <Divider />
            <PanelTable
                data={rows}
                toRowKey={toRowKey}
                columns={col}
                rowElement={
                    <PanelRow taskCompleted={taskCompleted} setRunner={setRunner} setTaskCompleted={setTaskCompleted} />
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
                <LevelBaseNew runner={runner} />
                <DialogActions>
                    {/* {actions} */}
                    <Button onClick={closeHandler}>{'退出'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface PanelRowProps {
    taskCompleted: boolean[];
    setRunner: React.Dispatch<React.SetStateAction<ILevelRunner | null>>;
    setTaskCompleted: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const PanelRow = React.memo(({ taskCompleted, setRunner, setTaskCompleted }: PanelRowProps) => {
    const { config, levelClass } = useRowData<Row>();
    const runner = React.useMemo(() => new levelClass(config), [levelClass, config]);
    const index = useIndex();
    const completed = taskCompleted[index];

    const levelUpdater = runner.updater.bind(runner);
    runner.updater = async () => {
        const r = await levelUpdater();
        setTaskCompleted(
            produce((draft) => {
                draft[index] = r === LevelAction.STOP;
            })
        );
        return r;
    };

    return (
        <SeaTableRow
            sx={{
                backgroundColor: completed ? `${alpha(theme.palette.primary.main, 0.18)}` : 'transparent',
            }}
        >
            <PanelField field="name">{levelClass.meta.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action">
                <Box component="span">
                    <Button
                        onClick={() => {
                            setRunner(runner);
                        }}
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
