import {
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
    Typography
} from '@mui/material';
import { delay } from '@sa-core/common';
import { BattleModule, Functions, PetHelper, Utils } from '@sa-core/index';
import React from 'react';
import dataProvider from './data';

interface Props {
    closeHandler: (running: boolean) => void;
}

interface levelData {
    stimulation: boolean;
    rewardReceived: boolean;
    challengeCount: number;
    curLayer: number;
    layerCount: number;
}

const RoutineModuleName = '勇者之塔';
const customData = dataProvider['LevelCourageTower'];
const maxDailyChallengeTimes = 5;

const updateLevelData = async (data: levelData) => {
    const bits = await Utils.GetBitSet(636, 1000577);
    const values = await Utils.GetMultiValue(18709, 18710);

    data.stimulation = bits[0];
    data.rewardReceived = bits[1];

    data.challengeCount = values[0];
    data.curLayer = values[1] & 255;
    data.layerCount = (values[1] >> 8) & 255;

    return data;
};

export function LevelCourageTower(props: Props) {
    const [running, setRunning] = React.useState(false);
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef<levelData>({} as levelData);

    const effect = async () => {
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                await updateLevelData(levelData.current);
                console.log(levelData.current);
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
                await Functions.switchBag(customData.pets);
                PetHelper.cureAllPet();
                PetHelper.setDefault(customData.pets[0].catchTime);
                setHint('准备背包完成');
                await delay(500);

                if (levelData.current.curLayer !== 30) {
                    setHint('正在进入关卡');
                    await SA.Utils.SocketSendByQueue(42395, [101, 3, 30, 0]);
                    await delay(500);
                }

                BattleModule.Manager.strategy.custom = customData.strategy;
                while (levelData.current.challengeCount < maxDailyChallengeTimes) {
                    await BattleModule.Manager.runOnce(() => {
                        setHint(
                            <>
                                <Typography component={'div'}>正在进行对战...</Typography>
                                <Typography component={'div'}>
                                    {`当前次数: ${levelData.current.challengeCount} / 5`}
                                    <LinearProgress
                                        color="inherit"
                                        variant="determinate"
                                        value={(levelData.current.challengeCount / 5) * 100}
                                    />
                                </Typography>
                                <Typography component={'div'}>
                                    {`当前进度: ${levelData.current.layerCount} / 5`}
                                    <LinearProgress
                                        color="inherit"
                                        variant="determinate"
                                        value={(levelData.current.layerCount / 5) * 100}
                                    />
                                </Typography>
                            </>
                        );
                        Utils.SocketSendByQueue(42396, [101, 30, levelData.current.layerCount + 1]);
                    });
                    await updateLevelData(levelData.current);
                }
                BattleModule.Manager.strategy.custom = undefined;
                setStep(0);

                break;
            case 2: //try get daily reward
                setHint('正在查询每日奖励领取状态');
                try {
                    await Utils.SocketSendByQueue(42395, [101, 4, 0, 0]);
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
                setHint('勇者之塔日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step]);
    return (
        <>
            <DialogTitle>{RoutineModuleName}</DialogTitle>
            <DialogContent>
                <DialogContentText component={'span'}>{hint}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        props.closeHandler(running);
                    }}
                >
                    {running ? '终止' : '退出'}
                </Button>
            </DialogActions>
        </>
    );
}
