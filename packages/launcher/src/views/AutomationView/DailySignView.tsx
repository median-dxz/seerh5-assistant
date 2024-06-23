import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import React from 'react';

import { Button, ButtonGroup, CircularProgress } from '@mui/material';

import { SeaTableRow } from '@/components/styled/TableRow';
import { useModStore } from '@/context/useModStore';
import type { TaskInstance } from '@/services/store/task';
import { LevelAction, delay } from '@sea/core';
import type { TaskRunner } from '@sea/mod-type';
import useSWR from 'swr';

export function DailySignView() {
    const { taskStore } = useModStore();
    const signs = Array.from(taskStore.values()).filter((i) => !(i.task.prototype as TaskRunner).selectLevelBattle);

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
    const { ownerMod, name, task: taskClass } = ins;
    const task = new taskClass();

    const { data: state, mutate } = useSWR(
        `ds://mod/sign/${ownerMod}/${name}`,
        async () => {
            await task.update();
            return { timesHaveRun: task.meta.maxTimes - task.data.remainingTimes, maxTimes: task.meta.maxTimes };
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
                        onClick={async () => {
                            console.log(`正在执行${name}`);
                            await task.update();
                            while (task.data.remainingTimes > 0) {
                                task.actions[LevelAction.AWARD].call(task);
                                await delay(50).then(() => task.update());
                            }
                            mutate();
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
