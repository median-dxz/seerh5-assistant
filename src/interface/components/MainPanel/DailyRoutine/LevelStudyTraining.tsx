import { Typography } from '@mui/material';
import { delay } from '@sa-core/common';
import { Battle, Functions, PetHelper, Utils } from '@sa-core/index';
import React from 'react';
import { PercentLinearProgress } from "../base";
import dataProvider from './data';
import { LevelBase, LevelExtendsProps } from './LevelBase';

interface LevelData {
    stimulation: boolean;
    rewardReceived: boolean;
    challengeCount: number;
    layerCount: number;
}

const RoutineModuleName = '学习力训练场';
const customData = dataProvider['LevelStudyTraining'];
const maxDailyChallengeTimes = 6;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await Utils.GetBitSet(637, 1000572);
    const playerInfo = new DataView(await Utils.SocketSendByQueue(42397, [102]));

    data.stimulation = bits[0];
    data.rewardReceived = bits[1];

    data.challengeCount = playerInfo.getUint32(8);
    data.layerCount = playerInfo.getUint32(56);

    return data;
};

export function LevelStudyTraining(props: LevelExtendsProps) {
    const { setRunning } = props;
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({} as LevelData);

    const effect = async () => {
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                levelData.current = await updateLevelData();
                // console.log(result);
                if (!levelData.current.rewardReceived) {
                    if (levelData.current.challengeCount < maxDailyChallengeTimes) {
                        setStep(1);
                    } else {
                        setStep(2);
                    }
                } else {
                    setStep(3);
                }
                break;
            case 1: //daily challenge
                setHint('正在准备背包');
                await Functions.switchBag(customData.cts);
                PetHelper.cureAllPet();
                PetHelper.setDefault(customData.cts[0]);
                setHint('准备背包完成');
                await delay(500);

                Battle.Manager.strategy.custom = customData.strategy;

                while (levelData.current.challengeCount < maxDailyChallengeTimes) {
                    await Battle.Manager.runOnce(() => {
                        setHint(
                            <>
                                <Typography component={'div'}>正在进行对战...</Typography>
                                <PercentLinearProgress
                                    prompt={'当前次数'}
                                    progress={levelData.current.challengeCount}
                                    total={6}
                                />
                                <PercentLinearProgress
                                    prompt={'当前进度'}
                                    progress={levelData.current.layerCount}
                                    total={5}
                                />
                            </>
                        );
                        Utils.SocketSendByQueue(42396, [102, 6, levelData.current.layerCount + 1]);
                    });
                    levelData.current = await updateLevelData();
                }
                Battle.Manager.strategy.custom = undefined;
                setStep(0);

                break;
            case 2: //try get daily reward
                setHint('正在查询每日奖励领取状态');
                try {
                    await Utils.SocketSendByQueue(42395, [102, 3, 0, 0]);
                } catch (error) {
                    setStep(-1);
                }

                await delay(500);
                setStep(0);
                break;
            case -1:
                setHint('领取奖励出错');
                setRunning(false);
                break;
            default:
                setHint(RoutineModuleName +'日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step]);
    return <LevelBase title={RoutineModuleName} hint={hint}></LevelBase>;
}
