import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import React from 'react';

import { Button, ButtonGroup, CircularProgress } from '@mui/material';

import { SeaTableRow } from '@/components/styled/TableRow';
import { useModStore } from '@/context/useModStore';
import type { TaskRunner } from '@/sea-launcher';
import type { TaskInstance } from '@/service/store/task';
import { LevelAction, delay } from '@sea/core';
import useSWR from 'swr';

export function DailySign() {
    const { taskStore } = useModStore();
    const signs = Array.from(taskStore.values()).filter(
        (i) => (Object.getPrototypeOf(i.task) as TaskRunner).selectLevelBattle
    );

    const columns: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '名称',
            },
            {
                field: 'mod',
                columnName: '模组',
            },
            {
                field: 'state',
                columnName: '状态',
            },
            {
                field: 'execute',
                columnName: '执行',
            },
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

    const { data: state, mutate } = useSWR(task, async (sign: TaskRunner) => {
        await sign.update();
        return sign.data;
    });

    return (
        <SeaTableRow>
            <PanelField field="name">{name}</PanelField>
            <PanelField field="mod">{ownerMod}</PanelField>
            <PanelField field="state">
                {!state ? (
                    <CircularProgress />
                ) : (
                    `# ${task.meta.maxTimes - state.remainingTimes} / ${task.meta.maxTimes}`
                )}
            </PanelField>
            <PanelField field="execute">
                <ButtonGroup>
                    <Button
                        onClick={async () => {
                            console.log(`正在执行${name}`);
                            while (task.next() === LevelAction.AWARD) {
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
