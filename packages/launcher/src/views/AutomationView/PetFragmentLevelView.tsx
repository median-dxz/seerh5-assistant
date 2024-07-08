import { PanelField, useRowData } from '@/components/PanelTable';
import { PanelTable, type PanelColumns } from '@/components/PanelTable/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';

import { Box, Button, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { PET_FRAGMENT_LEVEL_ID } from '@/builtin/petFragment';
import type { IPetFragmentRunner, PetFragmentOption } from '@/builtin/petFragment/types';
import { MOD_SCOPE_BUILTIN, QueryKey } from '@/constants';
import { useMainState } from '@/context/useMainState';
import { useModStore } from '@/context/useModStore';
import { useTaskScheduler } from '@/context/useTaskScheduler';
import { getNamespace as ns } from '@/services/mod/metadata';
import { engine, LevelAction } from '@sea/core';
import useSWR from 'swr';

const toRowKey = (data: PetFragmentOption) => engine.getPetFragmentLevelObj(data.id)!.Desc;

export function PetFragmentLevelView() {
    const { modStore, taskStore } = useModStore();
    const col: PanelColumns = React.useMemo(
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

    const modIns = modStore.get(ns({ scope: MOD_SCOPE_BUILTIN, id: PET_FRAGMENT_LEVEL_ID }));
    const taskIns = taskStore.get(PET_FRAGMENT_LEVEL_ID);
    const optionsList = useMemo(() => (modIns?.ctx.data as undefined | PetFragmentOption[]) ?? [], [modIns?.ctx.data]);

    if (!modIns || !taskIns) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography fontFamily={['Open Sans']}>未部署精灵因子模组</Typography>
            </Box>
        );
    }

    const missingIds = optionsList.map(({ id }) => id).filter((id) => !engine.getPetFragmentLevelObj(id));
    if (missingIds.length > 0) {
        return <Typography fontFamily={['Open Sans']}>错误的精灵因子ID: {missingIds.join(', ')}</Typography>;
    }

    return (
        <>
            <Button variant="outlined">运行全部</Button>
            <Button variant="outlined">添加新配置</Button>
            <PanelTable data={optionsList} toRowKey={toRowKey} columns={col} rowElement={<PanelRow />} />
        </>
    );
}

const PanelRow = React.memo(() => {
    const { setOpen } = useMainState();
    const { enqueue } = useTaskScheduler();
    const { taskStore } = useModStore();
    const options = useRowData<PetFragmentOption>();
    const task = taskStore.get(PET_FRAGMENT_LEVEL_ID)!.task;

    const runner = useMemo(
        () => task.runner(task.metadata, options as unknown as undefined) as IPetFragmentRunner,
        [options, task]
    );

    const { data: completed } = useSWR(
        [QueryKey.taskIsCompleted, task, options],
        async () => {
            await runner.update();
            return runner.next() === LevelAction.STOP;
        },
        {
            fallbackData: false
        }
    );

    return (
        <SeaTableRow>
            <PanelField field="name">{runner.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Typography>扫荡: {options.sweep ? '开启' : '关闭'}</Typography>
                <Button
                    onClick={() => {
                        enqueue(task, options as unknown as undefined);
                    }}
                    disabled={completed}
                >
                    启动
                </Button>
                <Button
                    onClick={() => {
                        void ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                        setOpen(false);
                    }}
                >
                    打开面板
                </Button>
            </PanelField>
        </SeaTableRow>
    );
});
