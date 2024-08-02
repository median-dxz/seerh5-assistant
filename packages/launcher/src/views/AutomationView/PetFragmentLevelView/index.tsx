import Add from '@mui/icons-material/AddRounded';

import { Button, Toolbar } from '@mui/material';
import type { Recipe } from '@sea/server';
import { toRaw } from '@vue/reactivity';
import { produce } from 'immer';
import { useCallback, useState } from 'react';

import { DataLoading } from '@/components/DataLoading';
import { PanelTable, type PanelColumn } from '@/components/SEAPanelTable';

import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { PET_FRAGMENT_LEVEL_ID } from '@/constants';
import { mod, ModStore } from '@/features/mod';
import { useAppSelector } from '@/shared';

import { AddOptionsForm } from './AddOptionsForm';
import { EditOptionsForm } from './EditOptionsForm';
import { PanelRow } from './PanelRow';
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
] as const satisfies PanelColumn[];

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
            <Toolbar>
                <Button
                    onClick={() => {
                        setAddFormOpen(true);
                    }}
                    startIcon={<Add />}
                    variant="outlined"
                >
                    添加新配置
                </Button>
            </Toolbar>

            <PanelTable
                data={optionsList}
                columns={columns}
                renderRow={(options, index) => (
                    <PanelRow
                        options={options}
                        index={index}
                        taskRef={taskRef}
                        task={task}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                    />
                )}
            />
            <AddOptionsForm open={addFormOpen} onClose={() => setAddFormOpen(false)} />
            <EditOptionsForm open={editFormOpen} onClose={() => setEditFormOpen(false)} index={editingItemIdx} />
        </OptionsListContext.Provider>
    );
}
