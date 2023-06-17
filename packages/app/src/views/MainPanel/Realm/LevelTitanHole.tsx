import React from 'react';

import { PetPosition, cureAllPet, delay, getBagPets, switchBag } from 'sa-core';
import * as SABattle from 'sa-core/battle';
import * as SAEngine from 'sa-core/engine';
import * as SAEntity from 'sa-core/entity';

import { Typography } from '@mui/material';

import { LabeledLinearProgress } from '@sa-app/components/LabeledProgress';
import { LevelBase, LevelExtendsProps } from './LevelBase';

import dataProvider from './data';

interface LevelData {
    stimulation: boolean;
    levelOpen: boolean;
    levelOpenCount: number;
    step: number;
    step2Count: number;
    step3Count: number;
}

const RealmName = '泰坦矿洞';
const customData = dataProvider['LevelTitanHole'];
const maxDailyChallengeTimes = 2;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await SAEngine.Socket.bitSet(640);
    const values = await SAEngine.Socket.multiValue(18724, 18725, 18726, 18727);

    data.stimulation = bits[0];

    data.levelOpenCount = values[0];
    data.step = (values[1] >> 8) & 255;
    data.levelOpen = data.step > 0;
    data.step2Count = (values[2] >> 8) & 255;
    data.step3Count = values[3] & 255;

    return data;
};

export function LevelTitanHole(props: LevelExtendsProps) {
    const { running: _, setRunning } = props;
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({} as LevelData);

    const effect = async () => {
        let pets: SAEntity.Pet[];
        let pet: undefined | SAEntity.Pet;
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                levelData.current = await updateLevelData();
                console.log(levelData.current);

                if (levelData.current.levelOpenCount < maxDailyChallengeTimes || levelData.current.levelOpen) {
                    setHint('正在准备背包');
                    await switchBag(customData.cts);
                    cureAllPet();
                    PetManager.setDefault(customData.cts[0]);
                    setHint('准备背包完成');
                    if (!levelData.current.levelOpen) {
                        await SAEngine.Socket.sendByQueue(42395, [104, 1, 3, 0]);
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
                await SABattle.Manager.runOnce(() => {
                    setHint(
                        <LabeledLinearProgress
                            prompt={'正在进行泰坦矿洞'}
                            progress={levelData.current.step}
                            total={4}
                        />
                    );
                    SAEngine.Socket.sendByQueue(42396, [104, 3, 1]);
                }, customData.strategy);
                levelData.current = await updateLevelData();
                setStep(0);
                break;
            case 2:
                pets = await getBagPets(PetPosition.bag1);
                pet = pets.find((pet) => pet.name === '艾欧丽娅');
                if (!pet) {
                    setStep(-3);
                    break;
                }
                PetManager.setDefault(pet.catchTime);
                await delay(500);
                while (levelData.current.step2Count < 6) {
                    await SABattle.Manager.runOnce(() => {
                        setHint(
                            <>
                                <LabeledLinearProgress
                                    prompt={'正在进行泰坦矿洞'}
                                    progress={levelData.current.step}
                                    total={4}
                                />
                                <LabeledLinearProgress
                                    prompt={'击败爆破先锋'}
                                    progress={levelData.current.step2Count}
                                    total={6}
                                />
                            </>
                        );
                        SAEngine.Socket.sendByQueue(42396, [104, 3, 2]);
                    }, customData.strategy);

                    levelData.current = await updateLevelData();
                }
                setStep(3);
                break;
            case 3:
                while (levelData.current.step3Count < 48) {
                    const i = levelData.current.step3Count + 1;
                    // eslint-disable-next-line prefer-const
                    let [row, col] = [Math.trunc(i / 11), (i % 11) + 1];
                    if (row % 2 === 1) {
                        col = 11 - col + 1;
                    }
                    setHint(
                        <>
                            <LabeledLinearProgress
                                prompt={'正在进行泰坦矿洞'}
                                progress={levelData.current.step}
                                total={4}
                            />
                            <LabeledLinearProgress
                                prompt={'开采矿石'}
                                progress={levelData.current.step3Count}
                                total={48}
                            />
                        </>
                    );
                    console.log('dig', row, col, row * 11 + col);

                    try {
                        await SAEngine.Socket.sendByQueue(42395, [104, 2, row * 11 + col, 0]);
                    } catch (error) {
                        setStep(-2);
                        break;
                    }

                    await delay(Math.random() * 100 + 200);
                    levelData.current = await updateLevelData();
                }
                setStep(4);
                break;
            case 4:
                pets = await getBagPets(PetPosition.bag1);
                pet = pets.find((pet) => pet.name === '幻影蝶');
                if (!pet) {
                    setStep(-3);
                    break;
                }
                PetManager.setDefault(pet.catchTime);
                await delay(500);
                await SABattle.Manager.runOnce(() => {
                    setHint(
                        <LabeledLinearProgress
                            prompt={'正在进行泰坦矿洞'}
                            progress={levelData.current.step}
                            total={4}
                        />
                    );
                    SAEngine.Socket.sendByQueue(42396, [104, 3, 4]);
                }, customData.strategy);
                levelData.current = await updateLevelData();
                setStep(5);
                break;
            case 5:
                try {
                    setHint('正在领取奖励');
                    await delay(500);
                    await SAEngine.Socket.sendByQueue(42395, [104, 5, 0, 0]);
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
            case -3:
                setHint('设置背包出错');
                setRunning(false);
                break;
            default:
                setHint(RealmName + '日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step]);
    return (
        <LevelBase title={RealmName} hint={hint}>
            <Typography>
                {`今日进入关卡次数: ${levelData.current.levelOpenCount} / ${maxDailyChallengeTimes}`}
            </Typography>
        </LevelBase>
    );
}
