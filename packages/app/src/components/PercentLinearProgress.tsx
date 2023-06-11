import {
    LinearProgress,
    LinearProgressProps, Typography
} from '@mui/material';
import React from 'react';

type Props = LinearProgressProps & {
    prompt?: string;
    cover?: string;
    progress: number;
    total: number;
};

export function PercentLinearProgress(props: Props) {
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
