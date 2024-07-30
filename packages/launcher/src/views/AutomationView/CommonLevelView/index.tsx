import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Refresh from '@mui/icons-material/RefreshRounded';
import Settings from '@mui/icons-material/Settings';

import type { PanelColumns } from '@/components/PanelTable';
import { CircularProgress } from '@mui/material';
import { LevelAction } from '@sea/core';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';

import { DataLoading } from '@/components/DataLoading';
import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { PanelField, PanelTable, useRowData } from '@/components/PanelTable/index';
import { SEAConfigForm } from '@/components/SEAConfigForm';
import { SeaTableRow } from '@/components/styled/TableRow';

import { taskStore, type TaskInstance } from '@/features/mod/store';
import { mapRefInStore } from '@/features/mod/useModStore';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';

import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID } from '@/constants';
import type { ModExportsRef } from '@/features/mod/utils';
import { dataApi } from '@/services/data';
import { getCompositeId, getTaskOptions, startAppListening, type TaskRunner } from '@/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { dequal } from 'dequal';

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

const taskViewColumns = [
    {
        field: 'name',
        columnName: '名称'
    },
    {
        field: 'cid',
        columnName: '模组'
    },
    {
        field: 'state',
        columnName: '状态'
    },
    {
        field: 'actions',
        columnName: '操作'
    }
] as const satisfies PanelColumns;

interface Row {
    ref: ModExportsRef;
    task: TaskInstance;
    runner: TaskRunner;
    options?: object;
}

const toRowKey = ({ ref: { cid, key } }: Row) => getCompositeId({ id: key, scope: cid });

export interface CommonLevelViewProps {
    filterLevelBattle: boolean;
}

export function CommonLevelView({ filterLevelBattle }: CommonLevelViewProps) {
    const taskRefs = useAppSelector(
        ({ mod: { taskRefs } }) =>
            taskRefs.filter(
                ({ cid }) => cid !== getCompositeId({ scope: MOD_SCOPE_BUILTIN, id: PET_FRAGMENT_LEVEL_ID })
            ),
        shallowEqual
    );

    const { data: taskConfig, isFetching, error } = dataApi.endpoints.allTaskConfig.useQuery();
    const rowCache = useRef(new WeakMap<ModExportsRef, Row>());

    const mapRefToRow = (ref: ModExportsRef) => {
        if (!taskConfig) {
            return undefined;
        }
        const task = mapRefInStore(ref, taskStore)!;
        const options = getTaskOptions(task, taskConfig);
        const runner = task.runner(options);

        let cachedRow = rowCache.current.get(ref);

        if (cachedRow) {
            if (cachedRow.options !== options) {
                cachedRow = { ...cachedRow, options, runner };
                rowCache.current.set(ref, cachedRow);
            }
            return cachedRow;
        } else {
            if (!runner.selectLevelBattle === filterLevelBattle) {
                cachedRow = { ref, options, task, runner };
                rowCache.current.set(ref, cachedRow);
                return cachedRow;
            }
            return undefined;
        }
    };

    const rows = taskRefs.map(mapRefToRow).filter(Boolean) as Row[];

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
    const { enqueueSnackbar } = useSnackbar();
    const { ref, options, task, runner } = useRowData<Row>();
    const [mutate] = dataApi.useSetTaskOptionsMutation();

    const [editFormOpen, setEditFormOpen] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [fetched, setFetched] = useState(false);

    const update = useCallback(
        async (active?: { current: boolean }) => {
            setFetched(false);
            await Promise.resolve();
            if (active && !active.current) return;
            try {
                await runner.update();
            } catch (error) {
                // TODO handle error
            }
            setCompleted(runner.next() === LevelAction.STOP);
            setFetched(true);
        },
        [runner]
    );

    useEffect(() => {
        const active = { current: true };
        void update(active);
        const unsubscribe = startAppListening({
            actionCreator: taskSchedulerActions.moveNext,
            effect: (action, api) => {
                const {
                    taskScheduler: { currentIndex, queue }
                } = api.getOriginalState();

                if (
                    currentIndex &&
                    queue[currentIndex].taskRef === ref &&
                    active.current &&
                    dequal(queue[currentIndex].options, options)
                ) {
                    void update();
                }
            }
        });
        return () => {
            active.current = false;
            unsubscribe();
        };
    }, [options, ref, update]);

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
                <IconButtonNoRipple title="刷新状态" onClick={() => update()}>
                    <Refresh />
                </IconButtonNoRipple>
                <IconButtonNoRipple
                    title="配置"
                    onClick={() => {
                        setEditFormOpen(true);
                    }}
                    disabled={!options}
                >
                    <Settings />
                </IconButtonNoRipple>
            </PanelField>
            {options && (
                <SEAConfigForm
                    open={editFormOpen}
                    onClose={() => {
                        setEditFormOpen(false);
                    }}
                    onSubmit={async (values) => {
                        await mutate({ id: getCompositeId({ scope: task.cid, id: task.metadata.id }), data: values });
                        enqueueSnackbar('配置已更新', { variant: 'success' });
                    }}
                    values={options}
                    schema={task.configSchema!}
                    title={`编辑配置: ${runner.name ?? task.metadata.name}`}
                />
            )}
        </SeaTableRow>
    );
});
