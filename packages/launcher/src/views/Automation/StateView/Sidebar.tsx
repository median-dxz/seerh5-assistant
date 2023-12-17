import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { Paper } from '@/components/styled/Paper';
import { Row } from '@/components/styled/Row';
import { useLevelScheduler } from '@/context/useLevelScheduler';
import Pause from '@mui/icons-material/PauseRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import { Button, Chip, Stack, Typography } from '@mui/material';
import React from 'react';

const StatusTextMap = {
    ready: '就绪',
    running: '运行中',
    waitingForStop: '等待停止',
};

export interface SidebarProps {
    height: string;
}

export function Sidebar({ height }: SidebarProps) {
    const { isPaused, pause, resume, status, queue } = useLevelScheduler();

    const handlePauseScheduler = () => {
        if (isPaused) {
            resume();
        } else {
            pause();
        }
    };

    const currentProgress = queue.length - Math.min(queue.filter((r) => r.status === 'pending').length, queue.length);

    return (
        <Paper
            sx={{
                height,
            }}
        >
            <Row alignItems="baseline" justifySelf="start" useFlexGap gap={4} mb={2}>
                <Typography variant="subtitle1">调度器</Typography>
                <Button
                    variant="outlined"
                    color="inherit"
                    sx={{ minWidth: 'auto', padding: '4px' }}
                    onClick={handlePauseScheduler}
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
                            fontSize: '1rem',
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
