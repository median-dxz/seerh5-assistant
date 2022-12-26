import { Typography } from '@mui/material';
import { delay } from '@sa-core/common';
import { BattleModule, Functions, PetHelper, Utils } from '@sa-core/index';
import React from 'react';
import { PercentLinearProgress } from "../base";
import dataProvider from './data';
import { LevelBase, LevelExtendsProps } from './LevelBase';

interface LevelData {
    stimulation: boolean;
    levelOpen: boolean;
    levelOpenCount: number;
    step: number;
    step2Count: number;
    step3Count: number;
}

const RoutineModuleName = '泰坦矿洞';
const customData = dataProvider['LevelTitanHole'];
const maxDailyChallengeTimes = 2;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await Utils.GetBitSet(640);
    const values = await Utils.GetMultiValue(18724, 18725, 18726, 18727);

    data.stimulation = bits[0];

    data.levelOpenCount = values[0];
    data.step = (values[1] >> 8) & 255;
    data.levelOpen = data.step > 0;
    data.step2Count = (values[2] >> 8) & 255;
    data.step3Count = values[3] & 255;

    return data;
};

export function LevelTitanHole(props: LevelExtendsProps) {
    const { running, setRunning } = props;
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({} as LevelData);

    const effect = async () => {
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                levelData.current = await updateLevelData();
                console.log(levelData.current);

                if (levelData.current.levelOpenCount < maxDailyChallengeTimes || levelData.current.levelOpen) {
                    setHint('正在准备背包');
                    await Functions.switchBag(customData.pets);
                    PetHelper.cureAllPet();
                    PetHelper.setDefault(customData.pets[0].catchTime);
                    setHint('准备背包完成');
                    BattleModule.Manager.strategy.custom = customData.strategy;

                    if (!levelData.current.levelOpen) {
                        await Utils.SocketSendByQueue(42395, [104, 1, 3, 0]);
                        setStep(1);
                    } else {
                        setStep(levelData.current.step);
                    }
                } else {
                    setStep(6);
                }

                break;
            case 1:
                await delay(500);
                await BattleModule.Manager.runOnce(() => {
                    setHint(
                        <PercentLinearProgress
                            prompt={'正在进行泰坦矿洞'}
                            progress={levelData.current.step + 1}
                            total={4}
                        />
                    );
                    Utils.SocketSendByQueue(42396, [104, 3, 1]);
                });
                levelData.current = await updateLevelData();
            case 2:
                PetHelper.setDefault(customData.pets.find((pet) => pet.name === '艾欧丽娅')!.catchTime);
                await delay(500);
                while (levelData.current.step2Count < 16) {
                    await BattleModule.Manager.runOnce(() => {
                        setHint(
                            <>
                                <PercentLinearProgress
                                    prompt={'正在进行泰坦矿洞'}
                                    progress={levelData.current.step + 1}
                                    total={4}
                                />
                                <PercentLinearProgress
                                    prompt={'击败爆破先锋'}
                                    progress={levelData.current.step2Count}
                                    total={16}
                                />
                            </>
                        );
                        Utils.SocketSendByQueue(42396, [104, 3, 2]);
                    });

                    levelData.current = await updateLevelData();
                }
            case 3:
                while (levelData.current.step3Count < 48) {
                    const i = levelData.current.step3Count + 1;
                    let [row, col] = [Math.trunc(i / 11), (i % 11) + 1];
                    if (row % 2 === 1) {
                        col = 11 - col + 1;
                    }
                    setHint(
                        <>
                            <PercentLinearProgress
                                prompt={'正在进行泰坦矿洞'}
                                progress={levelData.current.step + 1}
                                total={4}
                            />
                            <PercentLinearProgress
                                prompt={'开采矿石'}
                                progress={levelData.current.step3Count}
                                total={48}
                            />
                        </>
                    );
                    console.log('dig', row, col, row * 11 + col);

                    try {
                        await Utils.SocketReceivedPromise(42395, () => {
                            Utils.SocketSendByQueue(42395, [104, 2, row * 11 + col, 0]);
                        });
                    } catch (error) {
                        setStep(-2);
                        break;
                    }

                    await delay(Math.random() * 100 + 200);
                    levelData.current = await updateLevelData();
                }
            case 4:
                PetHelper.setDefault(customData.pets.find((pet) => pet.name === '幻影蝶')!.catchTime);
                await delay(500);
                await BattleModule.Manager.runOnce(() => {
                    setHint(
                        <PercentLinearProgress
                            prompt={'正在进行泰坦矿洞'}
                            progress={levelData.current.step + 1}
                            total={4}
                        />
                    );
                    Utils.SocketSendByQueue(42396, [104, 3, 4]);
                });
                levelData.current = await updateLevelData();
                BattleModule.Manager.strategy.custom = undefined;
                setStep(5);
                break;
            case 5:
                try {
                    setHint('正在领取奖励');
                    await delay(500);
                    await Utils.SocketSendByQueue(42395, [104, 5, 0, 0]);
                } catch (err) {
                    setStep(-1);
                }
                setStep(0);
                break;
            case -1:
                setHint('领取奖励出错');
                setRunning(false);
                break;
            case -2:
                setHint('自动开采矿石出错, 请手动开采');
                setRunning(false);
                break;
            default:
                setHint('泰坦矿洞日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step]);
    return (
        <LevelBase title={RoutineModuleName} hint={hint}>
            <Typography>
                {`今日进入关卡次数: ${levelData.current.levelOpenCount} / ${maxDailyChallengeTimes}`}
            </Typography>
        </LevelBase>
    );
}
