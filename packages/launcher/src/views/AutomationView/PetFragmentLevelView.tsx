import { Button, Stack, Typography } from '@mui/material';
import { engine, LevelAction } from '@sea/core';
import React, { useEffect, useMemo, useState } from 'react';

import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import { Row } from '@/components/styled/Row';
import { SeaTableRow } from '@/components/styled/TableRow';

import { PET_FRAGMENT_LEVEL_ID } from '@/builtin/petFragment';
import type { IPetFragmentRunner, PetFragmentOption } from '@/builtin/petFragment/types';
import { DataLoading } from '@/components/DataLoading';
import { MOD_SCOPE_BUILTIN } from '@/constants';
import { launcherActions } from '@/features/launcherSlice';
import { taskStore } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { getCompositeId, type ModExportsRef } from '@/features/mod/utils';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';
import { modApi } from '@/services/mod';
import { useAppDispatch, useAppSelector } from '@/store';

const toRowKey = (data: PetFragmentOption) => engine.getPetFragmentLevelObj(data.id)!.Desc;

export function PetFragmentLevelView() {
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

    const ref = useAppSelector(({ mod: { taskRefs } }) =>
        taskRefs.find(
            ({ modId, modScope, key }) =>
                modId === PET_FRAGMENT_LEVEL_ID && modScope === MOD_SCOPE_BUILTIN && key === PET_FRAGMENT_LEVEL_ID
        )
    );

    const cid = getCompositeId({ id: PET_FRAGMENT_LEVEL_ID, scope: MOD_SCOPE_BUILTIN });
    const { data = [], isFetching } = modApi.endpoints.data.useQuery(cid);
    const optionsList = data as PetFragmentOption[];

    if (isFetching || !ref) {
        return <DataLoading />;
    }

    const missingIds = optionsList.map(({ id }) => id).filter((id) => !engine.getPetFragmentLevelObj(id));
    if (missingIds.length > 0) {
        return <DataLoading error={`错误的精灵因子ID: ${missingIds.join(', ')}`} />;
    }

    return (
        <>
            <Row>
                <Stack
                    sx={{
                        flexDirection: 'row',
                        py: 3
                    }}
                    gap={2}
                    useFlexGap
                >
                    <Button variant="outlined">运行全部</Button>
                    <Button variant="outlined">添加新配置</Button>
                </Stack>
            </Row>

            <PanelTable data={optionsList} toRowKey={toRowKey} columns={col} rowElement={<PanelRow ref={ref} />} />
        </>
    );
}

interface RowProps {
    ref: ModExportsRef;
}

const PanelRow = React.memo(({ ref }: RowProps) => {
    const dispatch = useAppDispatch();
    const options = useRowData<PetFragmentOption>();
    const task = useMapToStore(() => ref, taskStore)!;
    const runner = useMemo(() => task.runner(options) as IPetFragmentRunner, [options, task]);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        void (async () => {
            await runner.update();
            setCompleted(runner.next() === LevelAction.STOP);
        })();
    }, [runner]);

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
                        dispatch(taskSchedulerActions.enqueue(ref, options, runner.name));
                    }}
                    disabled={completed}
                >
                    启动
                </Button>
                <Button
                    onClick={() => {
                        void ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                        dispatch(launcherActions.closeMain());
                    }}
                >
                    打开面板
                </Button>
            </PanelField>
        </SeaTableRow>
    );
});
