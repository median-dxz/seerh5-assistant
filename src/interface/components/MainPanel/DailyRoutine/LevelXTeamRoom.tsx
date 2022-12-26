import { delay } from '@sa-core/common';
import { BattleModule, Functions, PetHelper, Utils } from '@sa-core/index';
import React from 'react';
import dataProvider from './data';
import { LevelBase, LevelExtendsProps } from './LevelBase';

interface LevelData {
    open: boolean;
    dailyChallengeCount: number;
    dailyMinRound: number;
    dailyRewardReceived: boolean;
    weeklyRewardReceived: boolean;
    weeklyCompletedCount: number;
}

const RoutineModuleName = 'X战队密室';
const customData = dataProvider['LevelXTeamRoom'];
const maxDailyChallengeTimes = 3;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await Utils.GetBitSet(1000585, 2000036);
    const values = await Utils.GetMultiValue(1197, 12769, 12774, 20133);

    data.dailyRewardReceived = bits[0];
    data.weeklyRewardReceived = bits[1];

    data.open = Boolean(values[0]);
    data.dailyChallengeCount = values[1];
    data.dailyMinRound = values[2];
    data.weeklyCompletedCount = values[3];

    return data;
};

export function LevelXTeamRoom(props: LevelExtendsProps) {
    const { running, setRunning } = props;
    const [hint, setHint] = React.useState<string | JSX.Element>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({} as LevelData);

    const effect = async () => {
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                levelData.current = await updateLevelData();
                if (!levelData.current.dailyRewardReceived) {
                    if (
                        (levelData.current.dailyMinRound === 0 &&
                            levelData.current.dailyChallengeCount < maxDailyChallengeTimes) ||
                        levelData.current.open
                    ) {
                        setStep(1);
                    } else {
                        setStep(2);
                    }
                } else {
                    if (!levelData.current.weeklyRewardReceived) {
                        setStep(3);
                    } else {
                        setStep(4);
                    }
                }
                break;
            case 1: //daily challenge
                setHint('正在准备背包');
                await Functions.switchBag(customData.pets);
                PetHelper.cureAllPet();
                PetHelper.setDefault(customData.pets[0].catchTime);
                setHint('准备背包完成');
                await delay(500);

                BattleModule.Manager.strategy.custom = customData.strategy;

                setHint('正在开启关卡');
                await Utils.SocketSendByQueue(42395, [105, 1, 1, 0]);
                await delay(500);

                await BattleModule.Manager.runOnce(() => {
                    setHint(`正在进行对战...`);
                    Utils.SocketSendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [105, 7, 0]);
                });

                BattleModule.Manager.strategy.custom = undefined;
                setStep(0);

                break;
            case 2: //try get daily reward
                setHint('正在查询每日奖励领取状态');
                if (!levelData.current.dailyRewardReceived && levelData.current.dailyMinRound > 0) {
                    await Utils.SocketSendByQueue(42395, [105, 2, 0, 0]);
                }

                await delay(500);
                setStep(3);
                break;
            case 3: //try get weekly reward
                setHint('正在查询每周奖励领取状态');
                if (!levelData.current.weeklyRewardReceived && levelData.current.weeklyCompletedCount >= 5) {
                    await Utils.SocketSendByQueue(42395, [105, 3, 0, 0]);
                }

                await delay(500);
                setStep(4);
                break;
            default:
                setHint('x战队密室日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step]);
    return <LevelBase title={RoutineModuleName} hint={hint}></LevelBase>;
}
