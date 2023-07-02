import { DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { LabeledLinearProgress } from '@sa-app/components/LabeledProgress';
import React from 'react';

import { ILevelRunner, SALevelManager } from 'sa-core';

interface LevelProps {
    runner: ILevelRunner | null;
}

function useLevelRunner(runner: ILevelRunner | null) {
    const [state, setState] = React.useState<React.ReactNode>('');
    React.useEffect(() => {
        let active = true;
        (async () => {
            await SALevelManager.ins.stop();
            if (runner) {
                runner.logger = setState;
                active && SALevelManager.ins.run(runner);
            }
        })();

        return () => {
            active = false;
            SALevelManager.ins.stop();
        };
    }, [runner]);
    return state;
}

export function LevelBaseNew({ runner, children }: React.PropsWithChildren<LevelProps>) {
    const state = useLevelRunner(runner);

    if (!runner) {
        return <></>;
    }

    return (
        <>
            <DialogTitle>{runner.info.name}</DialogTitle>
            <DialogContent>
                <LabeledLinearProgress
                    prompt={`当前进度`}
                    progress={runner.info.maxTimes - runner.data.leftTimes}
                    total={runner.info.maxTimes}
                />
                {children}
                <DialogContentText component={'span'}>{state}</DialogContentText>
            </DialogContent>
        </>
    );
}
