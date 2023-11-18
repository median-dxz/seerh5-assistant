import { LinearProgress, LinearProgressProps, Typography } from '@mui/material';
import React from 'react';

type LabeledProgressProps = LinearProgressProps & {
    prompt?: string;
    overridePrompt?: React.ReactNode;
    progress: number;
    total: number;
};

export function LabeledLinearProgress({
    progress,
    total,
    prompt,
    overridePrompt,
    ...rest
}: LabeledProgressProps) {
    let display = prompt ? `${prompt}: ` : '';

    display += `${progress} / ${total}`;

    return (
        <Typography component={'div'}>
            {overridePrompt ?? display}
            <LinearProgress variant="determinate" value={(progress / total) * 100} {...rest} />
        </Typography>
    );
}
