import { Acute } from '@/components/icons/Acute';
import Add from '@mui/icons-material/AddRounded';
import AspectRatio from '@mui/icons-material/AspectRatioRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import Info from '@mui/icons-material/InfoOutlined';
import MoreHoriz from '@mui/icons-material/MoreHorizRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Settings from '@mui/icons-material/Settings';

import { Button, Chip, CircularProgress, Menu, MenuItem, Popover, Stack, Typography } from '@mui/material';
import { LevelAction, query, SEAPetStore, spet, type Pet } from '@sea/core';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PanelField, PanelTable, useIndex, useRowData, type PanelColumns } from '@/components/PanelTable';
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
import { getCompositeId, startAppListening, usePopupState } from '@/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { AddOptionsForm } from './AddOptionsForm';
import { EditOptionsForm } from './EditOptionsForm';

const toRowKey = (data: PetFragmentOptions) => JSON.stringify(data);

const columns = [
    {
        field: 'name',
        columnName: '名称'
    },
    { field: 'battles', columnName: '对战方案' },
    {
        field: 'state',
        columnName: '状态'
    },
    {
        field: 'actions',
        columnName: '操作'
    }
] as const satisfies PanelColumns;

export function PetFragmentLevelView() {
    const [addFormOpen, setAddFormOpen] = useState(false);

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

    const { data = [], isFetching: isFetchingModData } = modApi.useDataQuery(cid);

    const isFetching = isFetchingModData;

    if (isFetching || !modIns || !taskRef || !task) {
        return <DataLoading />;
    }

    const modData = modIns.ctx.data as PetFragmentOptions[];
    const optionsList = data as PetFragmentOptions[];

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
                            setAddFormOpen(true);
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
                columns={columns}
                rowElement={<PanelRow taskRef={taskRef} task={task} modData={modData} />}
            />
            <AddOptionsForm open={addFormOpen} setOpen={setAddFormOpen} modData={modData} />
        </>
    );
}

interface RowProps {
    taskRef: ModExportsRef;
    task: TaskInstance;
    modData: PetFragmentOptions[];
}

const PanelRow = React.memo(function PanelRow({ taskRef, task, modData }: RowProps) {
    const dispatch = useAppDispatch();
    const index = useIndex();
    const options = useRowData<PetFragmentOptions>();
    const runner = useMemo(() => task.runner(options) as IPetFragmentRunner, [options, task]);

    const pet = useRef<Pet | null>(null);
    const [completed, setCompleted] = useState(false);
    const [fetched, setFetched] = useState(false);

    const [editFormOpen, setEditFormOpen] = useState(false);

    const {
        state: moreState,
        open: openMore,
        close: closeMore
    } = usePopupState({
        popupId: 'more-actions-menu'
    });

    const { state: detailsState, open: openDetail } = usePopupState({
        popupId: 'level-details-popover'
    });

    const update = useCallback(async () => {
        const allPets = await SEAPetStore.getAllPets();
        const findResult = allPets.find(({ id }) => id === runner.level.petFragment.petId);
        if (findResult) {
            pet.current = await spet(findResult).done;
        } else {
            pet.current = null;
        }
        await runner.update();
        setCompleted(runner.next() === LevelAction.STOP);
        setFetched(true);
    }, [runner]);

    useEffect(() => {
        void update();
        const unsubscribe = startAppListening({
            actionCreator: taskSchedulerActions.moveNext,
            effect: update
        });
        return unsubscribe;
    }, [update]);

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
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    spacing={2}
                >
                    <span> {fetched ? completed ? '已完成' : '未完成' : <CircularProgress size="1.5rem" />}</span>
                    <IconButtonNoRipple title="关卡详情" onClick={openDetail}>
                        <Info fontSize="inherit" />
                    </IconButtonNoRipple>
                </Stack>
            </PanelField>
            <PanelField field="actions">
                <Row sx={{ width: '100%', justifyContent: 'center' }} spacing={1}>
                    <IconButtonNoRipple
                        title={options.sweep ? '扫荡' : '启动'}
                        sx={{
                            fontSize: '1.8rem'
                        }}
                        onClick={startLevel(options.sweep)}
                        disabled={completed || (options.sweep && !runner.data.canSweep)}
                    >
                        {options.sweep ? <Acute /> : <PlayArrow />}
                    </IconButtonNoRipple>
                    <IconButtonNoRipple
                        title="配置"
                        onClick={() => {
                            setEditFormOpen(true);
                        }}
                    >
                        <Settings />
                    </IconButtonNoRipple>

                    <IconButtonNoRipple title="更多操作" onClick={openMore}>
                        <MoreHoriz />
                    </IconButtonNoRipple>
                </Row>
            </PanelField>
            <Popover
                {...detailsState}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                slotProps={{
                    paper: { sx: { p: 2, fontSize: '1rem' } }
                }}
            >
                <Typography variant="inherit">
                    {runner.designId} · {runner.level.name}
                </Typography>
                <Typography variant="inherit">
                    精灵ID: {runner.level.petFragment.petId} · 物品ID: {runner.level.petFragment.itemId}
                </Typography>
                <Typography variant="inherit">因子产出: {runner.level.pieces[options.difficulty]}</Typography>
                <Typography variant="inherit">已收集: {runner.data.piecesOwned ?? 0}</Typography>
                <Typography variant="inherit">解锁扫荡: {runner.data.canSweep ? '是' : '否'}</Typography>
                <Typography variant="inherit">
                    本体: {pet.current ? '已兑换' : runner.level.petFragment.petConsume} · 魂印:{' '}
                    {pet.current?.isEffectActivated ? '已兑换' : runner.level.petFragment.effectConsume} · 第五:{' '}
                    {pet.current?.fifthSkill ? '已兑换' : runner.level.petFragment.fifthSkillConsume}
                </Typography>

                {runner.level.bosses[options.difficulty]?.map(({ battleBoss }, index) => (
                    <Typography key={index} variant="inherit">
                        {index + 1}: {query('pet').get(battleBoss)!.DefName}
                    </Typography>
                ))}
            </Popover>
            <Menu
                {...moreState}
                MenuListProps={{
                    sx: {
                        maxHeight: '50vh'
                    }
                }}
            >
                <MenuItem
                    sx={{ maxWidth: '25vw', fontSize: '1rem' }}
                    onClick={() => {
                        void ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                        dispatch(launcherActions.closeMain());
                        closeMore();
                    }}
                >
                    <AspectRatio fontSize="inherit" />
                    <Typography sx={{ ml: 2, mr: 2 }} fontSize="inherit">
                        打开面板
                    </Typography>
                </MenuItem>
                <MenuItem
                    sx={{ maxWidth: '25vw', fontSize: '1rem' }}
                    onClick={() => {
                        modData.splice(index, 1);
                    }}
                >
                    <Delete fontSize="inherit" />
                    <Typography sx={{ ml: 2, mr: 2 }} fontSize="inherit">
                        删除配置
                    </Typography>
                </MenuItem>
            </Menu>
            <EditOptionsForm open={editFormOpen} setOpen={setEditFormOpen} index={index} modData={modData} />
        </SeaTableRow>
    );
});
