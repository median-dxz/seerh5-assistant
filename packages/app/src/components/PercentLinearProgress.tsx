import { LinearProgress, LinearProgressProps, Typography } from '@mui/material';
import React from 'react';

type Props = LinearProgressProps & {
    prompt?: string;
    overridePrompt?: React.ReactNode;
    progress: number;
    total: number;
};

export function PercentLinearProgress({ progress, total, prompt, overridePrompt, ...rest }: Props) {
    let display = prompt ? `${prompt}: ` : '';
    
    display += `${progress} / ${total}`;

    return (
        <Typography component={'div'}>
            {overridePrompt ?? display}
            <LinearProgress variant="determinate" value={(progress / total) * 100} {...rest} />
        </Typography>
    );
}
