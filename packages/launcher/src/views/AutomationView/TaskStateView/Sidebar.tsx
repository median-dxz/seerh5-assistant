import Pause from '@mui/icons-material/PauseRounded';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';

import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { Row } from '@/components/styled/Row';
import { taskSchedulerActions } from '@/features/taskSchedulerSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { Button, ButtonGroup, Chip, Paper, Stack, Typography } from '@mui/material';

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
    const { pause: isPaused, queue } = useAppSelector((state) => state.taskScheduler);
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
                height,
                width: '100%',
                p: 4
            }}
        >
            <Typography variant="h2" sx={{ mb: 2 }}>
                调度器
            </Typography>
            <Stack
                sx={{
                    height: '100%',
                    justifyContent: 'center'
                }}
            >
                <Row alignItems="baseline">
                    <Typography>当前状态: </Typography>
                    <Chip label={StatusTextMap[status]} variant="outlined" size="small" />
                </Row>
                <ButtonGroup size="small" variant="outlined" color="inherit">
                    <Button
                        onClick={handlePauseScheduler}
                        disabled={status === 'waitingForStop'}
                        startIcon={isPaused ? <PlayArrow /> : <Pause />}
                    >
                        {isPaused ? '运行' : '暂停'}
                    </Button>
                </ButtonGroup>
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
