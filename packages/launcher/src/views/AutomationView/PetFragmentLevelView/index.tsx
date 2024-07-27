import { Acute } from '@/components/icons/Acute';
import Add from '@mui/icons-material/AddRounded';
import AspectRatio from '@mui/icons-material/AspectRatioRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Settings from '@mui/icons-material/Settings';

import { Button, Chip, CircularProgress, Stack } from '@mui/material';
import { engine, LevelAction } from '@sea/core';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PanelField, PanelTable, useIndex, useRowData } from '@/components/PanelTable';
import { Row } from '@/components/styled/Row';
import { SeaTableRow } from '@/components/styled/TableRow';

import type { IPetFragmentRunner, PetFragmentOptions } from '@/builtin/petFragment/types';
import { DataLoading } from '@/components/DataLoading';
import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID } from '@/constants';
import { launcherActions } from '@/features/launcherSlice';
import { deploymentSelectors } from '@/features/mod/slice';
import { modStore, taskStore, type TaskInstance } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { type ModExportsRef } from '@/features/mod/utils';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';
import { modApi } from '@/services/mod';
import { getCompositeId } from '@/shared/index';
import { startAppListening } from '@/shared/redux';
import { useAppDispatch, useAppSelector } from '@/store';
import { taskViewColumns } from '../shared';
import { AddOptionsForm } from './AddOptionsForm';

const toRowKey = (data: PetFragmentOptions) => JSON.stringify(data);

export function PetFragmentLevelView() {
    const [addOptionsFormOpen, setOpen] = useState(false);

    const cid = getCompositeId({ id: PET_FRAGMENT_LEVEL_ID, scope: MOD_SCOPE_BUILTIN });
    const taskRef = useAppSelector(({ mod: { taskRefs } }) =>
        taskRefs.find(({ cid: _cid, key }) => cid === _cid && key === PET_FRAGMENT_LEVEL_ID)
    );
    const deployment = useAppSelector((state) => deploymentSelectors.selectById(state, cid));
    const modIns = useMapToStore(
        () => (deployment.status === 'deployed' ? deployment.deploymentId : undefined),
        modStore
    );
    const task = useMapToStore(() => taskRef, taskStore);

    const { data = [], isFetching } = modApi.useDataQuery(cid);

    if (isFetching || !modIns || !taskRef || !task) {
        return <DataLoading />;
    }

    const modData = modIns.ctx.data as PetFragmentOptions[];
    const optionsList = data as PetFragmentOptions[];

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
                    spacing={2}
                >
                    <Button
                        onClick={() => {
                            setOpen(true);
                        }}
                        startIcon={<Add />}
                        variant="outlined"
                    >
                        添加新配置
                    </Button>
                </Stack>
            </Row>

            <PanelTable
                data={optionsList}
                toRowKey={toRowKey}
                columns={taskViewColumns.map((col) => {
                    if (col.field === 'cid') {
                        return { field: 'battles', columnName: '对战方案' };
                    }
                    return col;
                })}
                rowElement={
                    <PanelRow
                        taskRef={taskRef}
                        task={task}
                        remove={(index) => {
                            modData.splice(index, 1);
                        }}
                    />
                }
            />
            <AddOptionsForm open={addOptionsFormOpen} setOpen={setOpen} modData={modData} />
        </>
    );
}

interface RowProps {
    taskRef: ModExportsRef;
    task: TaskInstance;
    remove: (index: number) => void;
}

const PanelRow = React.memo(function PanelRow({ taskRef, task, remove }: RowProps) {
    const dispatch = useAppDispatch();
    const index = useIndex();
    const options = useRowData<PetFragmentOptions>();
    const runner = useMemo(() => task.runner(options) as IPetFragmentRunner, [options, task]);

    const [completed, setCompleted] = useState(false);
    const [fetched, setFetched] = useState(false);

    const mutate = useCallback(async () => {
        await runner.update();
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

    const startLevel = (sweep: boolean) => () =>
        dispatch(taskSchedulerActions.enqueue(taskRef, { ...options, sweep }, runner.name));

    return (
        <SeaTableRow sx={{ height: '3.3rem' }}>
            <PanelField field="name">{runner.name?.split('-').toSpliced(0, 1).join('-')}</PanelField>
            <PanelField
                field="battles"
                sx={{
                    fontFamily: ({ fonts }) => fonts.input
                }}
            >
                {options.battle && (
                    <Row sx={{ overflow: 'auto', width: '15rem' }} spacing={1}>
                        {options.battle.map((key, index) => (
                            <Chip key={index} label={`${index + 1}-${key}`} />
                        ))}
                    </Row>
                )}
            </PanelField>
            <PanelField field="state">
                {fetched ? completed ? '已完成' : '未完成' : <CircularProgress size="1.5rem" />}
            </PanelField>
            <PanelField field="actions">
                <Row sx={{ width: '100%', justifyContent: 'center' }} spacing={1}>
                    <IconButtonNoRipple
                        title={options.sweep ? '扫荡' : '启动'}
                        sx={{
                            fontSize: '1.8rem'
                        }}
                        onClick={startLevel(options.sweep)}
                        disabled={completed}
                    >
                        {options.sweep ? <Acute /> : <PlayArrow />}
                    </IconButtonNoRipple>
                    <IconButtonNoRipple
                        title="打开面板"
                        onClick={() => {
                            void ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                            dispatch(launcherActions.closeMain());
                        }}
                    >
                        <AspectRatio />
                    </IconButtonNoRipple>
                    <IconButtonNoRipple title="配置">
                        <Settings />
                    </IconButtonNoRipple>
                    <IconButtonNoRipple
                        title="删除"
                        onClick={() => {
                            remove(index);
                        }}
                    >
                        <Delete />
                    </IconButtonNoRipple>
                </Row>
            </PanelField>
        </SeaTableRow>
    );
});
