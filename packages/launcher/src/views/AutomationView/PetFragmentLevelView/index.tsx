import { Acute } from '@/components/icons/Acute';
import Add from '@mui/icons-material/AddRounded';
import AspectRatio from '@mui/icons-material/AspectRatioRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import Info from '@mui/icons-material/InfoOutlined';
import MoreHoriz from '@mui/icons-material/MoreHorizRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import Refresh from '@mui/icons-material/RefreshRounded';
import Settings from '@mui/icons-material/Settings';

import { Button, Chip, CircularProgress, Menu, MenuItem, Popover, Stack, Typography } from '@mui/material';
import { LevelAction, query, SEAPetStore, spet, type Pet } from '@sea/core';
import type { Recipe } from '@sea/server';
import { toRaw } from '@vue/reactivity';
import { produce } from 'immer';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataLoading } from '@/components/DataLoading';
import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { PanelField, PanelTable, useIndex, useRowData, type PanelColumns } from '@/components/PanelTable';
import { Row } from '@/components/styled/Row';
import { SeaTableRow } from '@/components/styled/TableRow';

import type { IPetFragmentRunner, PetFragmentOptions } from '@/builtin/petFragment/types';
import { PET_FRAGMENT_LEVEL_ID } from '@/constants';
import { launcher } from '@/features/launcher';
import { mod, ModStore, type ModExportsRef, type TaskInstance } from '@/features/mod';
import { taskScheduler } from '@/features/taskScheduler';
import { startAppListening, useAppDispatch, useAppSelector, usePopupState } from '@/shared';

import { AddOptionsForm } from './AddOptionsForm';
import { EditOptionsForm } from './EditOptionsForm';
import { cid, OptionsListContext } from './shared';

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
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [editingItemIdx, setEditingItemIdx] = useState<number>(0);

    const taskRef = useAppSelector((state) =>
        mod.taskRefs(state).find(({ cid: _cid, key }) => cid === _cid && key === PET_FRAGMENT_LEVEL_ID)
    );
    const task = ModStore.getTask(taskRef);
    const modIns = ModStore.getModIns(taskRef?.deploymentId);
    const modData = modIns?.ctx.data as PetFragmentOptions[];

    const [optionsList, setOptionsList] = useState<PetFragmentOptions[]>(structuredClone(toRaw(modData)));
    const mutate = useCallback(
        (recipe: Recipe<PetFragmentOptions[]>) => {
            recipe(modData);
            setOptionsList(produce(recipe));
        },
        [modData]
    );

    const handleEdit = useCallback(
        (index: number) => {
            setEditingItemIdx(index);
            setEditFormOpen(true);
        },
        [setEditFormOpen]
    );

    const handleDelete = useCallback(
        (index: number) => {
            mutate((draft) => {
                draft.splice(index, 1);
            });
        },
        [mutate]
    );

    if (!modIns || !taskRef || !task) {
        return <DataLoading />;
    }

    return (
        <OptionsListContext.Provider
            value={{
                optionsList,
                mutate
            }}
        >
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
                columns={columns}
                rowElement={
                    <PanelRow taskRef={taskRef} task={task} handleEdit={handleEdit} handleDelete={handleDelete} />
                }
            />
            <AddOptionsForm open={addFormOpen} onClose={() => setAddFormOpen(false)} />
            <EditOptionsForm open={editFormOpen} onClose={() => setEditFormOpen(false)} index={editingItemIdx} />
        </OptionsListContext.Provider>
    );
}

interface RowProps {
    taskRef: ModExportsRef;
    task: TaskInstance;
    handleEdit: (index: number) => void;
    handleDelete: (index: number) => void;
}

const PanelRow = React.memo(function PanelRow({ taskRef, task, handleEdit, handleDelete }: RowProps) {
    const dispatch = useAppDispatch();
    const index = useIndex();
    const options = useRowData<PetFragmentOptions>();
    const runner = useMemo(() => task.runner(options) as IPetFragmentRunner, [options, task]);

    const pet = useRef<Pet | null>(null);
    const [completed, setCompleted] = useState(false);
    const [fetched, setFetched] = useState(false);

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

    const update = useCallback(
        async (active?: { current: boolean }) => {
            setFetched(false);
            await Promise.resolve(); // for development environment render performance
            const allPets = await SEAPetStore.getAllPets();
            const findResult = allPets.find(({ id }) => id === runner.level.petFragment.petId);
            if (findResult) {
                pet.current = await spet(findResult).done;
            } else {
                pet.current = null;
            }
            if (active && !active.current) return;
            await runner.update();
            setCompleted(runner.next() === LevelAction.STOP);
            setFetched(true);
        },
        [runner]
    );

    useEffect(() => {
        const active = { current: true };
        void update(active);
        const unsubscribe = startAppListening({
            actionCreator: taskScheduler.run.fulfilled,
            effect: (action, api) => {
                const state = api.getState();
                const isCurrentTask = taskScheduler.isCurrentTaskByRefAndOptions(state, taskRef, options);

                if (isCurrentTask && active.current) {
                    void update();
                }
            }
        });
        return () => {
            active.current = false;
            unsubscribe();
        };
    }, [options, taskRef, update]);

    const startLevel = (sweep: boolean) => () =>
        dispatch(taskScheduler.enqueue(taskRef, { ...options, sweep }, runner.name));

    return (
        <SeaTableRow sx={{ height: '3.3rem' }}>
            <PanelField field="name" sx={{ width: '20vw', minWidth: '10rem' }}>
                {runner.name?.split('-').toSpliced(0, 1).join('-')}
            </PanelField>
            <PanelField
                field="battles"
                sx={{
                    fontFamily: ({ fonts }) => fonts.input
                }}
            >
                {options.battle && (
                    <Row sx={{ overflow: 'auto', width: 'calc(80vw - 36rem)', minWidth: '15rem', px: 2 }} spacing={1}>
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
                        disabled={completed || (options.sweep && !runner.data.canSweep) || !fetched}
                    >
                        {options.sweep ? <Acute /> : <PlayArrow />}
                    </IconButtonNoRipple>
                    <IconButtonNoRipple title="配置" onClick={() => handleEdit(index)}>
                        <Settings />
                    </IconButtonNoRipple>
                    <IconButtonNoRipple title="刷新状态" onClick={() => update()}>
                        <Refresh />
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
            <Menu {...moreState}>
                <MenuItem
                    sx={{ fontSize: '1rem' }}
                    onClick={() => {
                        void ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                        dispatch(launcher.closeMain());
                        closeMore();
                    }}
                >
                    <AspectRatio sx={{ mr: 2, ml: -1 }} fontSize="inherit" />
                    <Typography fontSize="inherit">打开面板</Typography>
                </MenuItem>
                <MenuItem
                    sx={{ fontSize: '1rem' }}
                    onClick={() => {
                        handleDelete(index);
                        closeMore();
                    }}
                >
                    <Delete sx={{ mr: 2, ml: -1 }} fontSize="inherit" />
                    <Typography fontSize="inherit">删除配置</Typography>
                </MenuItem>
            </Menu>
        </SeaTableRow>
    );
});
