import Pause from '@mui/icons-material/PauseRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';

import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { Paper } from '@/components/styled/Paper';
import { Row } from '@/components/styled/Row';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { Button, Chip, Stack, Typography } from '@mui/material';
import React from 'react';

const StatusTextMap = {
    idle: '就绪',
    pause: '暂停',
    running: '运行中',
    waitingForStop: '等待停止'
};

export interface SidebarProps {
    height: string;
}

export function Sidebar({ height }: SidebarProps) {
    const dispatch = useAppDispatch();
    const { isPaused, queue } = useAppSelector((state) => state.taskScheduler);
    let status: keyof typeof StatusTextMap = useAppSelector((state) => state.taskScheduler.status);

    const handlePauseScheduler = () => {
        if (isPaused) {
            dispatch(taskSchedulerActions.resume());
        } else {
            void dispatch(taskSchedulerActions.pause());
        }
    };

    if (status === 'idle' && isPaused) {
        status = 'pause';
    }

    const currentProgress = queue.length - Math.min(queue.filter((r) => r.status === 'pending').length, queue.length);

    return (
        <Paper
            sx={{
                height
            }}
        >
            <Row alignItems="baseline" justifySelf="start" useFlexGap gap={4} mb={2}>
                <Typography variant="subtitle1">调度器</Typography>
                <Button
                    variant="outlined"
                    color="inherit"
                    sx={{ minWidth: 'auto', padding: '4px' }}
                    onClick={handlePauseScheduler}
                    disabled={status === 'waitingForStop'}
                >
                    {isPaused ? <PlayArrow fontSize="inherit" /> : <Pause fontSize="inherit" />}
                </Button>
            </Row>
            <Stack justifyContent="space-around" height="100%" width="100%">
                <Row alignItems="baseline" useFlexGap gap={4}>
                    <Typography>当前状态: </Typography>
                    <Chip label={StatusTextMap[status]} variant="outlined" size="small" />
                </Row>
                {queue.length > 0 && (
                    <LabeledLinearProgress
                        typographyProps={{
                            color: ({ palette }) => palette.text.secondary,
                            fontSize: '1rem'
                        }}
                        overridePrompt={`${currentProgress} / ${queue.length}`}
                        progress={currentProgress}
                        total={queue.length}
                    />
                )}
            </Stack>
        </Paper>
    );
}
