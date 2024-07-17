import { DataLoading } from '@/components/DataLoading';
import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import { Button, ButtonGroup, CircularProgress } from '@mui/material';

import { taskStore, type TaskInstance } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { getCompositeId } from '@/features/mod/utils';

import { PET_FRAGMENT_LEVEL_ID } from '@/builtin/petFragment';
import { MOD_SCOPE_BUILTIN } from '@/constants';
import { configApi } from '@/services/config';
import { getTaskOptions } from '@/shared/index';
import { LevelAction, delay } from '@sea/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export function DailySignView() {
    const { data: configs, isFetching, error } = configApi.endpoints.allTaskConfig.useQuery();
    const tasks = useMapToStore(
        (state) =>
            state.mod.taskRefs.filter(
                ({ modId, modScope, key }) =>
                    modId !== PET_FRAGMENT_LEVEL_ID && modScope !== MOD_SCOPE_BUILTIN && key !== PET_FRAGMENT_LEVEL_ID
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

    const columns: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '名称'
            },
            {
                field: 'mod',
                columnName: '模组'
            },
            {
                field: 'state',
                columnName: '状态'
            },
            {
                field: 'execute',
                columnName: '执行'
            }
        ],
        []
    );

    if (isFetching) {
        return <DataLoading error={error?.message} />;
    }

    return (
        <>
            <PanelTable
                data={signs}
                columns={columns}
                rowElement={<PanelRow />}
                toRowKey={({ sign }) => getCompositeId({ scope: sign.cid, id: sign.metadata.id })}
            />
        </>
    );
}

const PanelRow = () => {
    const { sign, options } = useRowData<{ sign: TaskInstance; options?: object }>();
    const { cid: cid } = sign;

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
        <SeaTableRow>
            <PanelField field="name">{signName}</PanelField>
            <PanelField field="mod" sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                {cid}
            </PanelField>
            <PanelField field="state">
                {fetched ? `# ${progress} / ${maxTimes}` : <CircularProgress size="1.5rem" />}
            </PanelField>
            <PanelField field="execute">
                <ButtonGroup>
                    <Button
                        onClick={() => {
                            void (async () => {
                                console.log(`正在执行${signName}`);
                                await runner.update();
                                while (runner.data.remainingTimes > 0) {
                                    await runner.actions[LevelAction.AWARD]?.call(runner);
                                    await delay(50).then(() => runner.update());
                                }
                                await mutate();
                            })();
                        }}
                    >
                        执行
                    </Button>
                    <Button>查看详情</Button>
                </ButtonGroup>
            </PanelField>
        </SeaTableRow>
    );
};
