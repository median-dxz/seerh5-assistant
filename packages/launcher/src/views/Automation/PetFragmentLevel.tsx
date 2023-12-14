import { PanelField, useIndex, useRowData } from '@/components/PanelTable';
import { PanelTable, type PanelColumns } from '@/components/PanelTable/PanelTable';
import { SeaTableRow } from '@/components/styled/TableRow';
import * as endpoints from '@/service/endpoints';
import { theme } from '@/style';

import { Box, Button, CircularProgress, Typography, alpha } from '@mui/material';
import { produce } from 'immer';
import React, { useCallback } from 'react';
import useSWR from 'swr';

import {
    LevelAction,
    type PetFragmentLevelDifficulty as Difficulty,
    type ILevelBattle,
    type ILevelRunner,
    type PetFragmentLevel,
} from 'sea-core';

import { useLevelScheduler } from '@/context/useLevelScheduler';
import { useMainState } from '@/context/useMainState';
import { useModStore } from '@/context/useModStore';
import { store } from '@/service/store/battle';

export interface PetFragmentOption {
    id: number;
    difficulty: Difficulty;
    sweep: boolean;
    battle: ILevelBattle[];
}

export type PetFragmentOptionRaw = Omit<PetFragmentOption, 'battle'> & { battle: string[] };

export interface IPetFragmentRunner {
    readonly designId: number;
    readonly frag: PetFragmentLevel;
    option: PetFragmentOption;
}

type RunnerInstance = IPetFragmentRunner & ILevelRunner;

const loadOption = async (option: PetFragmentOptionRaw) => {
    return {
        ...option,
        battle: option.battle.map((n) => {
            const b = store.get(n);
            if (b) {
                return b.battle();
            }
            throw new Error(`Battle ${n} not found`);
        }),
    } as PetFragmentOption;
};

export function PetFragmentLevelPanel() {
    const { levelStore } = useModStore();

    const PetFragmentRunner = levelStore.get('PetFragmentLevel')!;
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const {
        data: rows = [],
        isLoading,
        error,
    } = useSWR('ds://configs/level/petFragment', async () => {
        const allConfig = await endpoints.getPetFragmentConfig();
        const options = await Promise.all(allConfig.map(loadOption));
        return options.map((option) => new PetFragmentRunner.level(option) as RunnerInstance);
    });

    rows.forEach((runner, index) => {
        const levelUpdater = runner.update.bind(runner);
        runner.update = async () => {
            const r = await levelUpdater();
            setTaskCompleted(
                produce((draft) => {
                    draft[index] = r === LevelAction.STOP;
                })
            );
            return r;
        };
    });

    React.useEffect(() => {
        rows.forEach((level) => level.update());
    }, [rows]);

    const col: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '关卡名称',
            },
            {
                field: 'state',
                columnName: '完成状态',
            },
            {
                field: 'action',
                columnName: '操作',
            },
            {
                field: 'config',
                columnName: '配置',
            },
        ],
        []
    );

    const toRowKey = useCallback((row: RunnerInstance) => row.frag.name, []);

    if (isLoading)
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mx: 2 }}>加载数据中</Typography>
                <CircularProgress />
            </Box>
        );

    if (error) {
        console.error(error);
        return <Typography fontFamily={['Open Sans']}>{String(error)}</Typography>;
    }

    return (
        <>
            <Button>一键日任</Button>
            <PanelTable
                data={rows}
                toRowKey={toRowKey}
                columns={col}
                rowElement={<PanelRow taskCompleted={taskCompleted} />}
            />
        </>
    );
}

interface PanelRowProps {
    taskCompleted: boolean[];
}

const PanelRow = React.memo(({ taskCompleted }: PanelRowProps) => {
    const { setOpen } = useMainState();
    const { enqueue } = useLevelScheduler();
    const runner = useRowData<RunnerInstance>();
    const index = useIndex();
    const completed = taskCompleted[index];

    return (
        <SeaTableRow
            sx={{
                backgroundColor: completed ? `${alpha(theme.palette.primary.main, 0.18)}` : 'transparent',
            }}
        >
            <PanelField field="name">{runner.frag.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Typography>扫荡: {runner.option.sweep ? '开启' : '关闭'}</Typography>
                <Button
                    onClick={() => {
                        enqueue(runner);
                    }}
                >
                    启动
                </Button>
                <Button
                    onClick={() => {
                        ModuleManager.showModuleByID(151, `{Design:${runner.designId}}`);
                        setOpen(false);
                    }}
                >
                    打开面板
                </Button>
            </PanelField>
        </SeaTableRow>
    );
});
