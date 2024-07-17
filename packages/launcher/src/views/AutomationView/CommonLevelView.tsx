import { Box, Button, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { DataLoading } from '@/components/DataLoading';
import { PanelField, useRowData } from '@/components/PanelTable';
import { PanelTable, type PanelColumns } from '@/components/PanelTable/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';

import { taskStore } from '@/features/mod/store';
import { mapToStore, useMapToStore } from '@/features/mod/useModStore';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';

import { PET_FRAGMENT_LEVEL_ID } from '@/builtin/petFragment';
import { MOD_SCOPE_BUILTIN } from '@/constants';
import type { ModExportsRef } from '@/features/mod/utils';
import { configApi } from '@/services/config';
import { getTaskOptions } from '@/shared/index';
import { useAppDispatch, useAppSelector } from '@/store';
import { LevelAction } from '@sea/core';
import { shallowEqual } from 'react-redux';

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
    ref: ModExportsRef;
    options?: object;
}

const toRowKey = (row: Row) => row.ref.key;

export function CommonLevelView() {
    const taskRefs = useAppSelector(
        ({ mod: { taskRefs } }) =>
            taskRefs.filter(
                ({ modScope, modId, key }) =>
                    !(
                        modScope === MOD_SCOPE_BUILTIN &&
                        modId === PET_FRAGMENT_LEVEL_ID &&
                        key === PET_FRAGMENT_LEVEL_ID
                    )
            ),
        shallowEqual
    );

    const { data: taskConfig, isFetching, error } = configApi.endpoints.allTaskConfig.useQuery();
    const rows = useMemo(
        () =>
            taskRefs
                .map((ref) => {
                    if (!taskConfig) {
                        return undefined;
                    }
                    const task = mapToStore(ref, taskStore)!;
                    const currentOptions = getTaskOptions(task, taskConfig);
                    const runner = task.runner(currentOptions);
                    if (runner.selectLevelBattle) {
                        return { ref, options: currentOptions } as Row;
                    }
                    return undefined;
                })
                .filter(Boolean) as Row[],
        [taskConfig, taskRefs]
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

    if (!taskConfig || isFetching) return <DataLoading />;

    if (error) {
        console.error(error);
        return <DataLoading error={error.message} />;
    }

    return (
        <>
            <PanelTable data={rows} toRowKey={toRowKey} columns={col} rowElement={<PanelRow />} />
        </>
    );
}

const PanelRow = React.memo(() => {
    const dispatch = useAppDispatch();
    const { ref, options } = useRowData<Row>();
    const task = useMapToStore(() => ref, taskStore)!;
    const runner = useMemo(() => task.runner(options), [options, task]);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        void (async () => {
            await runner.update();
            setCompleted(runner.next() === LevelAction.STOP);
        })();
    }, [runner]);

    return (
        <SeaTableRow>
            <PanelField field="name">{runner.name ?? task.metadata.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action">
                <Box component="span">
                    <Button
                        onClick={() => {
                            dispatch(taskSchedulerActions.enqueue(ref, options, runner.name));
                        }}
                        disabled={completed}
                    >
                        启动
                    </Button>
                </Box>
            </PanelField>
            <PanelField field="config"></PanelField>
        </SeaTableRow>
    );
});
