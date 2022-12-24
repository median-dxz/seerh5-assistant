import { DialogContent, DialogContentText, DialogTitle, LinearProgress, Typography } from '@mui/material';
import React from 'react';

export type LevelExtendsProps<P = unknown> = P & {
    running: boolean;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
};

interface LevelBaseProps {
    title: string;
    hint: string | JSX.Element;
}

export function LevelBase(props: React.PropsWithChildren<LevelBaseProps>) {
    return (
        <>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                {props.children}
                <DialogContentText component={'span'}>{props.hint}</DialogContentText>
            </DialogContent>
        </>
    );
}

interface PercentLinearProgressProps {
    prompt?: string;
    progress: number;
    total: number;
}

export function PercentLinearProgress(props: PercentLinearProgressProps) {
    return (
        <Typography component={'div'}>
            {`${props.prompt}${props.prompt && ':'} ${props.progress} / ${props.total}`}
            <LinearProgress color="inherit" variant="determinate" value={(props.progress / props.total) * 100} />
        </Typography>
    );
}
