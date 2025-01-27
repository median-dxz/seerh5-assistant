import { SwordLine } from '@/components/icons/SwordLine';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutline from '@mui/icons-material/ErrorOutlineRounded';
import FeedOutlined from '@mui/icons-material/FeedOutlined';
import HourglassEmptyRounded from '@mui/icons-material/HourglassEmptyRounded';
import Pending from '@mui/icons-material/PendingOutlined';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import RestartAlt from '@mui/icons-material/RestartAltRounded';
import Stop from '@mui/icons-material/StopRounded';

import {
    alpha,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
    type ListProps
} from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { ModStore } from '@/features/mod';
import { taskScheduler, type TaskState } from '@/features/taskScheduler';
import { useAppDispatch } from '@/shared';

import { RunnerDetailDialog } from './RunnerDetailDialog';

const StatusIconMap = {
    pending: <Pending fontSize="inherit" />,
    running: <PlayArrow color="primary" fontSize="inherit" />,
    completed: <CheckCircleOutline color="success" fontSize="inherit" />,
    error: <ErrorOutline color="error" fontSize="inherit" />,
    stopped: <Stop fontSize="inherit" />
};

const StatusTextMap = {
    pending: '等待中',
    running: '正在运行',
    completed: '已完成',
    error: '错误',
    stopped: '已停止'
};

const StatusActionsMap = {
    pending: { del: true, stop: false, retry: false },
    running: { del: false, stop: true, retry: false },
    completed: { del: true, stop: false, retry: false },
    error: { del: true, stop: false, retry: true },
    stopped: { del: true, stop: false, retry: true }
};

interface LevelStateListItemProps {
    state: TaskState;
}

export function TaskStateListItem({ state }: LevelStateListItemProps) {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useAppDispatch();
    const { runner, taskRef, status, error } = state;
    const [dialogOpen, setDialogOpen] = useState(false);

    const isRunning = status === 'running';
    const actionsControl = StatusActionsMap[status];

    const [_, setNow] = useState(0);

    useEffect(() => {
        let timer: number | undefined;
        if (isRunning) {
            timer = setInterval(() => {
                setNow(Date.now());
            }, 1000);
        }

        return () => {
            timer && clearInterval(timer);
        };
    }, [isRunning]);

    const handleCloseDialog = useCallback(() => setDialogOpen(false), []);

    return (
        <ListItem
            sx={{
                transition: (theme) => theme.transitions.create(['background-color']),
                backgroundColor: (theme) => {
                    if (error) {
                        return alpha(theme.palette.error.main, 0.12);
                    }
                    if (isRunning) {
                        return alpha(theme.palette.secondary.main, 0.12);
                    }
                },
                borderRadius: '6px',
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                    backgroundColor: (theme) => {
                        if (error) {
                            return alpha(theme.palette.error.main, 0.36);
                        }
                        if (isRunning) {
                            return alpha(theme.palette.secondary.main, 0.36);
                        }
                        return alpha(theme.palette.primary.main, 0.12);
                    }
                }
            }}
        >
            <ListItemIcon sx={{ fontSize: '24px' }}>{StatusIconMap[status]}</ListItemIcon>

            <ListItemText
                sx={{
                    width: '18rem',
                    '&:hover > *': {
                        overflow: 'visible'
                    }
                }}
                primary={`#${runner.id} ${runner.name}`}
                secondary={
                    <>
                        <Chip label={StatusTextMap[status]} variant="outlined" size="small" component="span" />
                        {state.startTime &&
                            !state.endTime &&
                            dayjs.duration(dayjs().diff(state.startTime)).format('mm:ss')}
                    </>
                }
                slotProps={{
                    primary: { sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                    secondary: {
                        sx: {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            gap: 2
                        }
                    }
                }}
            />

            {runner.data && isRunning && (
                <Stack sx={{ width: '100%', overflow: 'hidden' }} spacing={2}>
                    <LabeledLinearProgress
                        typographyProps={{
                            sx: {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '1rem'
                            }
                        }}
                        labelPosition="top-center"
                        overridePrompt={`${runner.data.progress}%`}
                        progress={runner.data.progress}
                        total={100}
                    />
                    <LabeledLinearProgress
                        typographyProps={{
                            sx: {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '1rem'
                            }
                        }}
                        prompt={`进度: `}
                        labelPosition="top-center"
                        progress={runner.data.maxTimes - runner.data.remainingTimes}
                        total={runner.data.maxTimes}
                    />
                </Stack>
            )}

            {error && (
                <ListItemButton
                    sx={{ width: '100%', borderRadius: 1, justifyContent: 'center' }}
                    onClick={() => {
                        setDialogOpen(true);
                    }}
                >
                    查看详情
                </ListItemButton>
            )}

            {status === 'completed' && (
                <ListItemText
                    sx={{ width: '100%' }}
                    secondary={
                        <>
                            <HourglassEmptyRounded fontSize="inherit" />
                            {dayjs.duration(dayjs(state.endTime).diff(state.startTime)).format('mm:ss')} <SwordLine />
                            {state.battleCount}
                        </>
                    }
                    slotProps={{
                        secondary: {
                            sx: {
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 2
                            }
                        }
                    }}
                />
            )}

            <IconButton
                title="详情"
                size="small"
                onClick={() => {
                    if (!ModStore.getTask(taskRef)) {
                        enqueueSnackbar('无效的任务引用', { variant: 'error' });
                        return;
                    }

                    setDialogOpen(true);
                }}
            >
                <FeedOutlined fontSize="inherit" />
            </IconButton>

            {actionsControl.stop && (
                <IconButton title="停止" size="small" onClick={() => dispatch(taskScheduler.abortCurrentRunner())}>
                    <Stop fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.retry && (
                <IconButton
                    title="重试"
                    size="small"
                    onClick={async () => {
                        await dispatch(taskScheduler.dequeue(runner.id));
                        dispatch(taskScheduler.enqueue(taskRef, state.options));
                    }}
                >
                    <RestartAlt fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.del && (
                <IconButton
                    title="删除"
                    size="small"
                    color="error"
                    onClick={() => dispatch(taskScheduler.dequeue(runner.id))}
                >
                    <Delete fontSize="inherit" />
                </IconButton>
            )}
            <RunnerDetailDialog onClose={handleCloseDialog} open={dialogOpen} taskState={state} taskRef={taskRef} />
        </ListItem>
    );
}

export function TaskStateList(listProps: ListProps) {
    const { queue } = taskScheduler.useSelectProps('queue');
    return (
        <>
            <List {...listProps}>
                {queue.map((state) => (
                    <TaskStateListItem key={state.runner.id} state={state} />
                ))}
            </List>
            {queue.length === 0 && (
                <Stack sx={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <FeedOutlined />
                    <Typography>暂无任何任务</Typography>
                </Stack>
            )}
        </>
    );
}
