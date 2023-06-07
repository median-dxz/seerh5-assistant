import {
    LinearProgress,
    LinearProgressProps, Typography
} from '@mui/material';
import React from 'react';

type PercentLinearProgressProps = LinearProgressProps & {
    prompt?: string;
    cover?: string;
    progress: number;
    total: number;
};

export function PercentLinearProgress(props: PercentLinearProgressProps) {
    let display = null;
    if (props.cover != undefined) {
        display = props.cover;
    } else if (props.prompt) {
        display = `${props.prompt}${props.prompt && ':'} ${props.progress} / ${props.total}`;
    } else {
        display = `${props.progress} / ${props.total}`;
    }
    return (
        <Typography component={'div'}>
            {display}
            <LinearProgress
                color="inherit"
                variant="determinate"
                value={(props.progress / props.total) * 100}
                {...props} />
        </Typography>
    );
}
