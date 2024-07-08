import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { PanelField, useRowData } from '@/components/PanelTable';
import { PanelTable, type PanelColumns } from '@/components/PanelTable/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { MOD_SCOPE_BUILTIN, QueryKey } from '@/constants';
import { useModStore } from '@/context/useModStore';
import { useTaskScheduler } from '@/context/useTaskScheduler';
import { getNamespace as ns } from '@/services/mod/metadata';
import type { TaskInstance } from '@/services/store/task';
import { useTaskConfig } from '@/services/useTaskConfig';
import { getTaskCurrentOptions } from '@/shared';
import type { AnyTask } from '@/shared/types';
import { LevelAction } from '@sea/core';
import type { TaskConfigData } from '@sea/server';
import useSWR from 'swr';

//      name: '作战实验室'
//      name: '六界神王殿',
//      async sweep() {
//          await socket.sendByQueue(45767, [38, 3]);
//          return;
//      },
//      async getState() {
//          let state = true;
//          const values = await socket.multiValue(11411, 11412, 11413, 11414);
//          for (let i = 1; i <= 7; i++) {
//              const group = Math.trunc((i - 1) / 2);
//              const v = [values[group] & ((1 << 16) - 1), values[group] >> 16];
//              // console.log(v[(i - 1) % 2] & 15);
//              if ((v[(i - 1) % 2] & 15) < 3) {
//                  state = false;
//                  break;
//              }
//          }
//          return state;
//      },
//  },

interface Row {
    taskInstance: TaskInstance;
    config?: TaskConfigData;
}

const toRowKey = (row: Row) => row.taskInstance.id;

export function CommonLevelView() {
    const { taskStore } = useModStore();
    const { data: taskConfig, isLoading, error } = useTaskConfig();

    const rows = useMemo(
        () =>
            Array.from(taskStore.values())
                .filter(({ ownerMod, task: _task, id }) => {
                    if (!taskConfig) {
                        return false;
                    }

                    if (ownerMod === ns({ scope: MOD_SCOPE_BUILTIN, id: 'PetFragmentLevel' })) {
                        return false;
                    }

                    const task = _task as AnyTask;

                    const runner = task.runner(task.metadata, getTaskCurrentOptions(task, taskConfig.get(id)));
                    return Boolean(runner.selectLevelBattle);
                })
                .map((task) => ({ taskInstance: task, config: taskConfig?.get(task.id) }) as Row),
        [taskConfig, taskStore]
    );

    const col: PanelColumns = useMemo(
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

    if (!taskConfig || isLoading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography sx={{ mx: 2 }}>加载数据中</Typography>
                <CircularProgress />
            </Box>
        );

    if (error) {
        console.error(error);
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography fontFamily={['Open Sans']}>{String(error)}</Typography>;
            </Box>
        );
    }

    return (
        <>
            <Button>一键日任</Button>
            <PanelTable data={rows} toRowKey={toRowKey} columns={col} rowElement={<PanelRow />} />
        </>
    );
}

const PanelRow = React.memo(() => {
    const { enqueue } = useTaskScheduler();
    const {
        taskInstance: { task, name: taskName },
        config
    } = useRowData<Row>();

    const currentOptions = useMemo(() => getTaskCurrentOptions(task as AnyTask, config), [task, config]);

    const { data: completed } = useSWR(
        [QueryKey.taskIsCompleted, task],
        async () => {
            const runner = (task as AnyTask).runner(task.metadata, currentOptions);
            await runner.update();
            return runner.next() === LevelAction.STOP;
        },
        {
            fallbackData: false
        }
    );

    return (
        <SeaTableRow>
            <PanelField field="name">{taskName}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action">
                <Box component="span">
                    <Button onClick={() => enqueue(task, currentOptions)} disabled={completed}>
                        启动
                    </Button>
                </Box>
            </PanelField>
            <PanelField field="config"></PanelField>
        </SeaTableRow>
    );
});
