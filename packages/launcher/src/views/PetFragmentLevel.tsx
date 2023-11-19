import { PetFragmentLevelDifficulty as Difficulty, LevelState, PetFragmentLevel, delay } from 'sea-core';

import { Box, Button, CircularProgress, Dialog, DialogActions, Divider, Typography, alpha } from '@mui/material';
import { SEAContext } from '@sea-launcher/context/SAContext';
import type { PetFragmentOption } from '@sea-launcher/service/endpoints';
import React, { useCallback, useState } from 'react';
import * as Battle from 'sea-core/battle';
import * as Engine from 'sea-core/engine';
import type { IPFLevelBoss, IPetFragmentLevelObject } from 'sea-core/entity';
import type { ILevelBattleStrategy, ILevelRunner, LevelData as SEALevelData, LevelInfo as SEALevelInfo } from 'sea-core/level';
import { PanelTable, type PanelColumns } from '../components/PanelTable/PanelTable';

import { loadBattle } from '@sea-launcher/service/ModManager';
import { saTheme } from '@sea-launcher/style';

declare namespace pvePetYinzi {
    const DataManager: unknown;
}

interface LevelInfo extends SEALevelInfo, IPetFragmentLevelObject {
    designId: number;
}

interface LevelData extends SEALevelData {
    pieces: number;
    failedTimes: number;
    curDifficulty: Difficulty;
    curPosition: number;
    isChallenge: boolean;
    bosses: IPFLevelBoss[];
}

export interface Option {
    id: number;
    difficulty: Difficulty;
    sweep: boolean;
    battle: ILevelBattleStrategy[];
}

const loadOption = async (option: PetFragmentOption) => {
    return { ...option, battle: await Promise.all(option.battle.map((n) => loadBattle(n))) } as Option;
};

export class PetFragmentRunner implements ILevelRunner<LevelData, LevelInfo> {
    data: LevelData;
    info: LevelInfo;
    option: Option;
    logger: (msg: React.ReactNode) => void;

    constructor(option: Option) {
        this.option = option;
        this.option.battle = this.option.battle.map((strategy) => {
            const beforeBattle = async () => {
                await delay(Math.round(Math.random() * 1000) + 5000);
                return strategy.beforeBattle?.();
            };
            return { ...strategy, beforeBattle };
        });

        const LevelObj: SEA.PetFragmentLevelObj = config.xml
            .getAnyRes('new_super_design')
            .Root.Design.find((r: SEA.PetFragmentLevelObj) => r.ID === option.id);

        const level = new PetFragmentLevel(LevelObj);

        this.info = {
            ...level,
            designId: level.id,
            maxTimes: level.totalTimes,
        };
        this.data = { success: false } as LevelData;

        this.logger = SeaModuleLogger(`精灵因子-${this.info.name}`, 'info');
    }

    selectBattle() {
        return this.option.battle.at(this.data.curPosition)!;
    }

    async updater() {
        const { info: config, data } = this;
        const values = await Engine.Socket.multiValue(
            config.values.openTimes,
            config.values.failTimes,
            config.values.progress
        );

        data.pieces = await Engine.getItemNum(this.info.petFragmentItem);

        data.leftTimes = this.info.maxTimes - values[0];
        data.failedTimes = values[1];
        data.curDifficulty = (values[2] >> 8) & 255;
        if (data.curDifficulty === Difficulty.NotSelected && this.option.difficulty) {
            data.curDifficulty = this.option.difficulty;
        }
        data.curPosition = values[2] >> 16;
        data.isChallenge = data.curDifficulty !== 0 && data.curPosition !== 0;
        switch (data.curDifficulty) {
            case Difficulty.Ease:
                data.bosses = config.level.ease;
                break;
            case Difficulty.Normal:
                data.bosses = config.level.ease;
                break;
            case Difficulty.Hard:
                data.bosses = config.level.ease;
                break;
            default:
                break;
        }
        this.data = { ...this.data };

        if (data.isChallenge || data.leftTimes > 0) {
            if (this.option.sweep) {
                return 'sweep' as unknown as LevelState;
            } else {
                return LevelState.BATTLE;
            }
        } else {
            this.data.success = true;
            return LevelState.STOP;
        }
    }

    readonly actions: Record<string, () => Promise<void>> = {
        sweep: async () => {
            await Engine.Socket.sendByQueue(41283, [this.info.designId, 4 + this.data.curDifficulty]);
            this.logger('执行一次扫荡');
        },
        battle: async () => {
            const checkData = await Engine.Socket.sendByQueue(41284, [this.info.designId, this.data.curDifficulty]);
            const check = new DataView(checkData!).getUint32(0);
            if (check === 0) {
                Engine.Socket.sendByQueue(41282, [this.info.designId, this.data.curDifficulty]);
            } else {
                const err = `出战情况不合法: ${check}`;
                BubblerManager.getInstance().showText(err);
                throw new Error(err);
            }
        },
    };

    openPanel() {
        ModuleManager.showModuleByID(151, `{Design:${this.info.designId}}`);
    }
}

function logDataByName(factorName: string) {
    const data = config.xml
        .getAnyRes('new_super_design')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .Root.Design.find((r: any) => (r.Desc as string).match(factorName));
    console.log(data);
}

function getCurPanelInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log((pvePetYinzi.DataManager as any)._instance.curYinziData);
}

import { PanelField, useIndex, useRowData } from '@sea-launcher/components/PanelTable';
import { SeaTableRow } from '@sea-launcher/components/styled/TableRow';
import * as Endpoints from '@sea-launcher/service/endpoints';
import { SeaModuleLogger } from '@sea-launcher/utils/logger';
import { produce } from 'immer';
import useSWR from 'swr';
import { LevelBaseNew } from './LevelBaseNew';
import { LevelCourageTower } from './Realm/LevelCourageTower';
import { ElfKingsId, LevelElfKingsTrial } from './Realm/LevelElfKingsTrial';
import { LevelExpTraining } from './Realm/LevelExpTraining';
import { LevelStudyTraining } from './Realm/LevelStudyTraining';
import { LevelXTeamRoom } from './Realm/LevelXTeamRoom';

export function PetFragmentLevelPanel() {
    const [runner, setRunner] = useState<null | PetFragmentRunner>(null);
    const [taskCompleted, setTaskCompleted] = React.useState<Array<boolean>>([]);

    const { Battle: battleContext } = React.useContext(SEAContext);
    const [battleAuto, setBattleAuto] = [battleContext.enableAuto, battleContext.updateAuto];
    const open = Boolean(runner);

    const closeHandler = () => {
        if (battleContext.enableAuto) {
            Battle.Manager.clear();
            setBattleAuto(false);
        }
        setRunner(null);
    };

    const { data: rows = [] } = useSWR('ds://sa/level/petFragment', async () => {
        const allConfig = await Endpoints.getPetFragmentConfig();
        const options = await Promise.all(allConfig.map(loadOption));
        return options
            .map((option) => new PetFragmentRunner(option))
            .concat(new LevelCourageTower({ stimulation: false, sweep: false }) as unknown as PetFragmentRunner)
            .concat(new LevelExpTraining({ stimulation: false, sweep: false }) as unknown as PetFragmentRunner)
            .concat(new LevelStudyTraining({ stimulation: false, sweep: false }) as unknown as PetFragmentRunner)
            .concat(
                new LevelElfKingsTrial({
                    stimulation: false,
                    sweep: false,
                    elfId: ElfKingsId.战王,
                }) as unknown as PetFragmentRunner
            )
            .concat(new LevelXTeamRoom() as unknown as PetFragmentRunner);
    });

    rows.forEach((runner, index) => {
        const levelUpdater = runner.updater.bind(runner);
        runner.updater = async () => {
            const r = await levelUpdater();
            setTaskCompleted(
                produce((draft) => {
                    draft[index] = r === LevelState.STOP;
                })
            );
            return r;
        };
    });

    React.useEffect(() => {
        rows.forEach((level) => level.updater());
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

    const toRowKey = useCallback((row: PetFragmentRunner) => row.info.name, []);

    if (!rows.length)
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mx: 2 }}>加载数据中</Typography>
                <CircularProgress />
            </Box>
        );

    return (
        <>
            <Button>一键日任</Button>
            <Divider />
            <PanelTable
                data={rows}
                toRowKey={toRowKey}
                columns={col}
                rowElement={<PanelRow taskCompleted={taskCompleted} setRunner={setRunner} />}
            />
            <Dialog
                open={open}
                sx={{
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '& .MuiDialog-paper': {
                        minWidth: 384,
                    },
                }}
            >
                <LevelBaseNew runner={runner} />
                <DialogActions>
                    {/* {actions} */}
                    <Button onClick={closeHandler}>{battleAuto ? '终止' : '退出'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface PanelRowProps {
    taskCompleted: boolean[];
    setRunner: React.Dispatch<React.SetStateAction<PetFragmentRunner | null>>;
}

const PanelRow = React.memo(({ taskCompleted, setRunner }: PanelRowProps) => {
    const runner = useRowData<PetFragmentRunner>();
    const index = useIndex();
    const completed = taskCompleted[index];

    return (
        <SeaTableRow
            sx={{
                backgroundColor: completed ? `${alpha(saTheme.palette.primary.main, 0.18)}` : 'transparent',
            }}
        >
            <PanelField field="name">{runner.info.name}</PanelField>
            <PanelField field="state">
                <Typography color={completed ? '#eeff41' : 'inherited'}>{completed ? '已完成' : '未完成'}</Typography>
            </PanelField>
            <PanelField field="action" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Typography>扫荡: {runner.option.sweep ? '开启' : '关闭'}</Typography>
                <Button
                    onClick={() => {
                        setRunner(runner);
                    }}
                >
                    启动
                </Button>
            </PanelField>
        </SeaTableRow>
    );
});
