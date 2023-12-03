import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React from 'react';

import { LevelManager as SEALevelManager, type ILevelRunner } from 'sea-core';

interface LevelProps {
    runner: ILevelRunner | null;
}

function useLevelRunner(runner: ILevelRunner | null) {
    const [state, setState] = React.useState<React.ReactNode>('');
    React.useEffect(() => {
        let active = true;
        (async () => {
            await SEALevelManager.ins.stop();
            if (runner) {
                runner.logger = setState;
                active && SEALevelManager.ins.run(runner);
            }
        })();

        return () => {
            active = false;
            SEALevelManager.ins.stop();
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
            <DialogTitle>{runner.meta.name}</DialogTitle>
            <DialogContent>
                <LabeledLinearProgress
                    prompt={`当前进度`}
                    progress={runner.meta.maxTimes - runner.data.leftTimes}
                    total={runner.meta.maxTimes}
                />
                {children}
                <DialogContentText component={'span'}>{state}</DialogContentText>
            </DialogContent>
        </>
    );
}
