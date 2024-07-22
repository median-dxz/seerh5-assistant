import Delete from '@mui/icons-material/DeleteOutlineRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Settings from '@mui/icons-material/Settings';

import { Button, Stack, Typography } from '@mui/material';
import { engine, LevelAction } from '@sea/core';
import React, { useEffect, useMemo, useState } from 'react';

import Add from '@mui/icons-material/AddRounded';

import { PanelField, PanelTable, useRowData } from '@/components/PanelTable';
import { Row } from '@/components/styled/Row';
import { SeaTableRow } from '@/components/styled/TableRow';

import type { IPetFragmentRunner, PetFragmentOptions } from '@/builtin/petFragment/types';
import { DataLoading } from '@/components/DataLoading';
import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID } from '@/constants';
import { launcherActions } from '@/features/launcherSlice';
import { taskStore } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { type ModExportsRef } from '@/features/mod/utils';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';
import { modApi } from '@/services/mod';
import { getCompositeId } from '@/shared/index';
import { useAppDispatch, useAppSelector } from '@/store';
import { taskViewColumns } from '../shared';
import { AddOptionsForm } from './AddOptionsForm';

const toRowKey = (data: PetFragmentOptions) => engine.getPetFragmentLevelObj(data.id)!.Desc;

export function PetFragmentLevelView() {
    const ref = useAppSelector(({ mod: { taskRefs } }) =>
        taskRefs.find(
            ({ cid, key }) =>
                cid === getCompositeId({ scope: MOD_SCOPE_BUILTIN, id: PET_FRAGMENT_LEVEL_ID }) &&
                key === PET_FRAGMENT_LEVEL_ID
        )
    );
    const [addOptionsFormOpen, setOpen] = useState(false);

    const cid = getCompositeId({ id: PET_FRAGMENT_LEVEL_ID, scope: MOD_SCOPE_BUILTIN });
    const { data = [], isFetching } = modApi.endpoints.data.useQuery(cid);
    const optionsList = data as PetFragmentOptions[];

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
                columns={taskViewColumns}
                rowElement={<PanelRow ref={ref} />}
            />
            <AddOptionsForm open={addOptionsFormOpen} setOpen={setOpen} />
        </>
    );
}

interface RowProps {
    ref: ModExportsRef;
}

const PanelRow = React.memo(({ ref }: RowProps) => {
    const dispatch = useAppDispatch();
    const options = useRowData<PetFragmentOptions>();
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
        <SeaTableRow sx={{ height: '3.3rem' }}>
            <PanelField field="name">{runner.name}</PanelField>
            <PanelField field="cid" sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                {ref.cid}
            </PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="actions" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <IconButtonNoRipple
                    title="启动"
                    onClick={() => {
                        dispatch(taskSchedulerActions.enqueue(ref, options, runner.name));
                    }}
                    disabled={completed}
                >
                    <PlayArrow />
                </IconButtonNoRipple>
                <IconButtonNoRipple title="配置">
                    <Settings />
                </IconButtonNoRipple>
                <IconButtonNoRipple
                    title="打开面板"
                    onClick={() => {
                        void ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                        dispatch(launcherActions.closeMain());
                    }}
                ></IconButtonNoRipple>
                <IconButtonNoRipple title="删除">
                    <Delete />
                </IconButtonNoRipple>
            </PanelField>
        </SeaTableRow>
    );
});
