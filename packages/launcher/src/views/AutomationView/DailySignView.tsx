import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import React, { useMemo } from 'react';

import { Button, ButtonGroup, CircularProgress } from '@mui/material';

import { SeaTableRow } from '@/components/styled/TableRow';
import { MOD_SCOPE_BUILTIN } from '@/constants';
import { useModStore } from '@/context/useModStore';
import { getNamespace as ns } from '@/services/mod/metadata';
import type { TaskInstance } from '@/services/store/task';
import { useTaskConfig } from '@/services/useTaskConfig';
import { getTaskCurrentOptions } from '@/shared';
import type { AnyTask } from '@/shared/types';
import { LevelAction, delay } from '@sea/core';
import useSWR from 'swr';

export function DailySignView() {
    const { taskStore } = useModStore();
    const { data: taskConfig } = useTaskConfig();

    const signs = useMemo(
        () =>
            Array.from(taskStore.values()).filter(({ ownerMod, task: _task, id }) => {
                if (!taskConfig) {
                    return false;
                }

                if (ownerMod === ns({ scope: MOD_SCOPE_BUILTIN, id: 'PetFragmentLevel' })) {
                    return false;
                }

                const task = _task as AnyTask;

                const runner = task.runner(task.metadata, getTaskCurrentOptions(task, taskConfig.get(id)));
                return !runner.selectLevelBattle;
            }),
        [taskConfig, taskStore]
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

    return (
        <>
            <PanelTable
                data={signs}
                columns={columns}
                rowElement={<PanelRow />}
                toRowKey={(sign) => `${sign.ownerMod}::${sign.name}`}
            />
        </>
    );
}

const PanelRow = () => {
    const ins = useRowData<TaskInstance>();
    const { ownerMod, name, task: _task } = ins;
    const task = _task as AnyTask;
    const runner = task.runner(task.metadata, getTaskCurrentOptions(task));

    const { data: state, mutate } = useSWR(
        `ds://mod/sign/${ownerMod}/${name}`,
        async () => {
            await runner.update();
            return {
                timesHaveRun: task.metadata.maxTimes - runner.data.remainingTimes,
                maxTimes: task.metadata.maxTimes
            };
        },
        { revalidateOnFocus: false, revalidateOnMount: true }
    );

    return (
        <SeaTableRow>
            <PanelField field="name">{name}</PanelField>
            <PanelField field="mod">{ownerMod}</PanelField>
            <PanelField field="state">
                {!state ? <CircularProgress /> : `# ${state.timesHaveRun} / ${state.maxTimes}`}
            </PanelField>
            <PanelField field="execute">
                <ButtonGroup>
                    <Button
                        onClick={() => {
                            void (async () => {
                                console.log(`正在执行${name}`);
                                await runner.update();
                                while (runner.data.remainingTimes > 0) {
                                    await runner.actions[LevelAction.AWARD]?.call(task);
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
