import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Settings from '@mui/icons-material/Settings';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DataLoading } from '@/components/DataLoading';
import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { PanelField, PanelTable, useRowData } from '@/components/PanelTable/index';
import { SEAConfigForm } from '@/components/SEAConfigForm';
import { SeaTableRow } from '@/components/styled/TableRow';

import { taskStore, type TaskInstance } from '@/features/mod/store';
import { mapToStore } from '@/features/mod/useModStore';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';

import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID } from '@/constants';
import type { ModExportsRef } from '@/features/mod/utils';
import { dataApi } from '@/services/data';
import { getCompositeId, getTaskOptions, startAppListening, type TaskRunner } from '@/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import { LevelAction } from '@sea/core';
import { shallowEqual } from 'react-redux';
import { taskViewColumns } from './shared';

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
    task: TaskInstance;
    runner: TaskRunner;
    options?: object;
}

const toRowKey = ({ ref: { cid, key } }: Row) => getCompositeId({ id: key, scope: cid });

export function CommonLevelView() {
    const taskRefs = useAppSelector(
        ({ mod: { taskRefs } }) =>
            taskRefs.filter(
                ({ cid }) => cid !== getCompositeId({ scope: MOD_SCOPE_BUILTIN, id: PET_FRAGMENT_LEVEL_ID })
            ),
        shallowEqual
    );

    const { data: taskConfig, isFetching, error } = dataApi.endpoints.allTaskConfig.useQuery();

    const rows = useMemo(
        () =>
            taskRefs
                .map((ref) => {
                    if (!taskConfig) {
                        return undefined;
                    }
                    const task = mapToStore(ref, taskStore)!;
                    const options = getTaskOptions(task, taskConfig);
                    const runner = task.runner(options);
                    if (runner.selectLevelBattle) {
                        return { ref, options, task, runner } satisfies Row;
                    }
                    return undefined;
                })
                .filter(Boolean) as Row[],
        [taskConfig, taskRefs]
    );

    if (!taskConfig || isFetching) return <DataLoading />;

    if (error) {
        console.error(error);
        return <DataLoading error={error.message} />;
    }

    return (
        <>
            <PanelTable data={rows} toRowKey={toRowKey} columns={taskViewColumns} rowElement={<PanelRow />} />
        </>
    );
}

const PanelRow = React.memo(function PanelRow() {
    const dispatch = useAppDispatch();
    const { ref, options, task, runner } = useRowData<Row>();

    const [editFormOpen, setEditFormOpen] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [fetched, setFetched] = useState(false);

    const mutate = useCallback(async () => {
        try {
            await runner.update();
        } catch (error) {
            // TODO handle error
        }
        setCompleted(runner.next() === LevelAction.STOP);
        setFetched(true);
    }, [runner]);

    useEffect(() => {
        void mutate();
        const unsubscribe = startAppListening({
            actionCreator: taskSchedulerActions.moveNext,
            effect: mutate
        });
        return unsubscribe;
    }, [mutate]);

    return (
        <SeaTableRow sx={{ height: '3.3rem' }}>
            <PanelField field="name">{runner.name ?? task.metadata.name}</PanelField>
            <PanelField field="cid" sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                {ref.cid}
            </PanelField>
            <PanelField field="state">
                {fetched ? completed ? '已完成' : '未完成' : <CircularProgress size="1.5rem" />}
            </PanelField>
            <PanelField field="actions">
                <IconButtonNoRipple
                    title="启动"
                    onClick={() => {
                        dispatch(taskSchedulerActions.enqueue(ref, options, runner.name));
                    }}
                    disabled={completed}
                >
                    <PlayArrow />
                </IconButtonNoRipple>
                <IconButtonNoRipple
                    title="配置"
                    onClick={() => {
                        setEditFormOpen(true);
                    }}
                >
                    <Settings />
                </IconButtonNoRipple>
            </PanelField>
            <SEAConfigForm open={editFormOpen} config={options} />
        </SeaTableRow>
    );
});
