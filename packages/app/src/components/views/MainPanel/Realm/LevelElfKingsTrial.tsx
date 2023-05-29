import { Typography } from '@mui/material';
import React from 'react';
import { cureAllPet, delay, SABattle, SAEngine, switchBag } from 'seerh5-assistant-core';
import { PercentLinearProgress } from '../base';
import dataProvider from './data';
import { LevelBase, LevelExtendsProps } from './LevelBase';

const ElfKingsId = {
    光王斯嘉丽: 2,
    水王沧岚: 8,
    自然王莫妮卡: 17,
    龙妈乔特鲁德: 6,
    草王茉蕊儿: 15,
    海瑟薇: 12,
    邪灵王摩哥斯: 14,
    格劳瑞: 9,
    战王: 13,
    秘王: 7,
} as const;

interface LevelData {
    stimulation: boolean;
    unlockHard: boolean;
    canRewardReceive: boolean;
    weeklyChallengeCount: number;
    challengeCount: number;
    elfId: AttrConst<typeof ElfKingsId>;
}

const RealmName = '精灵王的试炼';
const customData = dataProvider['LevelElfKingsTrial'];
const maxDailyChallengeTimes = 6;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await SAEngine.Socket.bitSet(8832, 2000037);
    const values = await SAEngine.Socket.multiValue(108105, 108106, 18745, 20134);

    data.elfId = ElfKingsId.战王;

    data.stimulation = bits[0];
    data.canRewardReceive = !bits[1];

    const levelStage = data.elfId <= 10 ? values[0] : values[1];
    const stageElfId = ((data.elfId - 1) % 9) * 3;
    data.unlockHard = Boolean(levelStage & (1 << (stageElfId + 2)));

    data.challengeCount = values[2];
    data.weeklyChallengeCount = values[3];
    return data;
};

export function LevelElfKingsTrial(props: LevelExtendsProps) {
    const { running, setRunning } = props;
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({ elfId: ElfKingsId.草王茉蕊儿 } as LevelData);
    const currentRunning = React.useRef(false);
    currentRunning.current = running;

    const effect = async () => {
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                levelData.current = await updateLevelData();
                console.log(levelData.current);
                if (!levelData.current.unlockHard) {
                    setStep(-2);
                    break;
                }

                if (levelData.current.challengeCount < maxDailyChallengeTimes) {
                    setStep(1);
                } else {
                    setStep(2);
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
                        SAEngine.Socket.sendByQueue(42396, [106, levelData.current.elfId, 2]);
                    }, customData.strategy);
                    levelData.current = await updateLevelData();
                }
                setStep(0);
                break;
            case 2: //try get daily reward
                setHint('正在查询每周奖励领取状态');
                if (levelData.current.weeklyChallengeCount >= 100 && levelData.current.canRewardReceive) {
                    try {
                        await SAEngine.Socket.sendByQueue(42395, [106, 3, 0, 0]);
                    } catch (error) {
                        setStep(-1);
                    }
                }

                await delay(500);
                setStep(3);
                break;
            case -1:
                setHint('领取奖励出错');
                setRunning(false);
                break;
            case -2:
                setHint('未解锁困难难度');
                setRunning(false);
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
