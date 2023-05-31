import { Typography } from '@mui/material';
import React from 'react';
import { PercentLinearProgress } from '../base';
import { LevelBase, LevelExtendsProps } from './LevelBase';
import dataProvider from './data';

import { cureAllPet, delay, switchBag } from 'sa-core';

import * as SABattle from 'sa-../battle/index.js';
import * as SAEngine from 'sa-../engine/index.js';

interface LevelData {
    stimulation: boolean;
    rewardReceived: boolean;
    challengeCount: number;
}

const RealmName = '学习力训练场';
const customData = dataProvider['LevelStudyTraining'];
const maxDailyChallengeTimes = 6;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await SAEngine.Socket.bitSet(637, 1000572);
    const playerInfo = new DataView(await SAEngine.Socket.sendByQueue(42397, [115]));

    data.stimulation = bits[0];
    data.rewardReceived = bits[1];

    data.challengeCount = playerInfo.getUint32(8);

    return data;
};

export function LevelStudyTraining(props: LevelExtendsProps) {
    const { running, setRunning } = props;
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({} as LevelData);
    const currentRunning = React.useRef(false);
    currentRunning.current = running;

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
                await switchBag(customData.cts);
                cureAllPet();
                PetManager.setDefault(customData.cts[0]);
                setHint('准备背包完成');
                await delay(500);

                while (levelData.current.challengeCount < maxDailyChallengeTimes && currentRunning.current) {
                    await SABattle.Manager.runOnce(() => {
                        setHint(
                            <>
                                <Typography component={'div'}>正在进行对战...</Typography>
                                <PercentLinearProgress
                                    prompt={'当前次数'}
                                    progress={levelData.current.challengeCount}
                                    total={6}
                                />
                            </>
                        );
                        SAEngine.Socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [115, 6, 1]);
                    }, customData.strategy);
                    levelData.current = await updateLevelData();
                }
                setStep(0);

                break;
            case 2: //try get daily reward
                setHint('正在查询每日奖励领取状态');
                try {
                    await SAEngine.Socket.sendByQueue(42395, [115, 3, 0, 0]);
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
                setHint(RealmName + '日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step, running]);
    return <LevelBase title={RealmName} hint={hint}></LevelBase>;
}
