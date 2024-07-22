import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Settings from '@mui/icons-material/Settings';

import { DataLoading } from '@/components/DataLoading';
import { PanelField, PanelTable, useRowData } from '@/components/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { CircularProgress } from '@mui/material';

import { taskStore, type TaskInstance } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { getCompositeId } from '@/shared/index';

import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID } from '@/constants';
import { configApi } from '@/services/config';
import { getTaskOptions } from '@/shared/index';
import { LevelAction, delay } from '@sea/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { taskViewColumns } from './shared';

export function DailySignView() {
    const { data: configs, isFetching, error } = configApi.endpoints.allTaskConfig.useQuery();
    const tasks = useMapToStore(
        (state) =>
            state.mod.taskRefs.filter(
                ({ cid }) => cid !== getCompositeId({ scope: MOD_SCOPE_BUILTIN, id: PET_FRAGMENT_LEVEL_ID })
            ),
        taskStore
    );
    const signs = useMemo(
        () =>
            tasks
                .filter((task) => {
                    if (!configs) return false;

                    const runner = task.runner(getTaskOptions(task, configs));
                    return !runner.selectLevelBattle;
                })
                .map((sign) => ({ sign, options: getTaskOptions(sign, configs!) })),
        [configs, tasks]
    );

    if (isFetching) {
        return <DataLoading error={error?.message} />;
    }

    return (
        <>
            <PanelTable
                data={signs}
                columns={taskViewColumns}
                rowElement={<PanelRow />}
                toRowKey={({ sign }) => getCompositeId({ scope: sign.cid, id: sign.metadata.id })}
            />
        </>
    );
}

const PanelRow = () => {
    const { sign, options } = useRowData<{ sign: TaskInstance; options?: object }>();

    const runner = useMemo(() => sign.runner(options), [options, sign]);
    const [progress, setProgress] = useState(runner.data.progress);
    const [maxTimes, setMaxTimes] = useState(runner.data.maxTimes);
    const [fetched, setFetched] = useState(false);

    const mutate = useCallback(async () => {
        await runner.update();
        setMaxTimes(runner.data.maxTimes);
        setProgress(runner.data.maxTimes - runner.data.remainingTimes);
        setFetched(true);
    }, [runner]);

    useEffect(() => {
        void mutate();
    }, [mutate]);

    const signName = runner.name ?? sign.metadata.name;

    return (
        <SeaTableRow sx={{ height: '3.3rem' }}>
            <PanelField field="name">{signName}</PanelField>
            <PanelField field="cid" sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                {sign.cid}
            </PanelField>
            <PanelField field="state">
                {fetched ? `# ${progress} / ${maxTimes}` : <CircularProgress size="1.5rem" />}
            </PanelField>
            <PanelField field="actions">
                <IconButtonNoRipple
                    title="启动"
                    onClick={async () => {
                        console.log(`正在执行${signName}`);
                        await runner.update();
                        while (runner.data.remainingTimes > 0) {
                            await runner.actions[LevelAction.AWARD]?.call(runner);
                            await delay(50).then(() => runner.update());
                        }
                        await mutate();
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
