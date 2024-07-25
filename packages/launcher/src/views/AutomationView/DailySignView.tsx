import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Settings from '@mui/icons-material/Settings';

import { DataLoading } from '@/components/DataLoading';
import { PanelField, PanelTable, useRowData } from '@/components/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { CircularProgress } from '@mui/material';

import { taskStore, type TaskInstance } from '@/features/mod/store';
import { mapToStore } from '@/features/mod/useModStore';
import { getCompositeId } from '@/shared/index';

import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID } from '@/constants';
import type { ModExportsRef } from '@/features/mod/utils';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';
import { configApi } from '@/services/config';
import { getTaskOptions } from '@/shared/index';
import { startAppListening } from '@/shared/redux';
import type { TaskRunner } from '@/shared/types';
import { useAppDispatch, useAppSelector } from '@/store';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { taskViewColumns } from './shared';

interface Row {
    ref: ModExportsRef;
    task: TaskInstance;
    runner: TaskRunner;
    options?: object;
}

const toRowKey = ({ ref: { cid, key } }: Row) => getCompositeId({ id: key, scope: cid });

export function DailySignView() {
    const taskRefs = useAppSelector(
        ({ mod: { taskRefs } }) =>
            taskRefs.filter(
                ({ cid }) => cid !== getCompositeId({ scope: MOD_SCOPE_BUILTIN, id: PET_FRAGMENT_LEVEL_ID })
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
                    const options = getTaskOptions(task, taskConfig);
                    const runner = task.runner(options);
                    if (!runner.selectLevelBattle) {
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
            <PanelTable data={rows} columns={taskViewColumns} rowElement={<PanelRow />} toRowKey={toRowKey} />
        </>
    );
}

const PanelRow = () => {
    const dispatch = useAppDispatch();
    const { ref, runner, task, options } = useRowData<Row>();

    const [progress, setProgress] = useState(runner.data.progress);
    const [maxTimes, setMaxTimes] = useState(runner.data.maxTimes);
    const [fetched, setFetched] = useState(false);

    const mutate = useCallback(async () => {
        try {
            await runner.update();
        } catch (error) {
            // TODO handle error
        }
        setMaxTimes(runner.data.maxTimes);
        setProgress(runner.data.maxTimes - runner.data.remainingTimes);
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
                {task.cid}
            </PanelField>
            <PanelField field="state">
                {fetched ? `# ${progress} / ${maxTimes}` : <CircularProgress size="1.5rem" />}
            </PanelField>
            <PanelField field="actions">
                <IconButtonNoRipple
                    title="启动"
                    onClick={() => {
                        void dispatch(taskSchedulerActions.enqueue(ref, options, runner.name));
                    }}
                    disabled={progress === maxTimes}
                >
                    <PlayArrow />
                </IconButtonNoRipple>
                <IconButtonNoRipple title="配置">
                    <Settings />
                </IconButtonNoRipple>
            </PanelField>
        </SeaTableRow>
    );
};
