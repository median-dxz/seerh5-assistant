import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { useTaskScheduler, type TaskState } from '@/context/useTaskScheduler';
import {
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme,
    type ListProps
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { SwordLine } from '@/components/icons/SwordLine';
import { Paper } from '@/components/styled/Paper';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineRounded';
import Close from '@mui/icons-material/Close';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutline from '@mui/icons-material/ErrorOutlineRounded';
import FeedOutlined from '@mui/icons-material/FeedOutlined';
import HourglassEmptyRounded from '@mui/icons-material/HourglassEmptyRounded';
import Pending from '@mui/icons-material/PendingOutlined';
import PlayArrow from '@mui/icons-material/PlayArrowRounded';
import RestartAlt from '@mui/icons-material/RestartAltRounded';
import Stop from '@mui/icons-material/StopOutlined';
import type { TaskRunner } from '@sea/mod-type';

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

const timeFormatter = (n: number) => {
    const { format } = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2
    });
    return `${format(Math.trunc(n / 1000 / 60))}:${format(Math.trunc(n / 1000) % 60)}`;
};

const timePrintFormatter = Intl.DateTimeFormat('zh-cn', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

export function TaskStateListItem({ state }: LevelStateListItemProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { dequeue, enqueue, stopCurrentRunner } = useTaskScheduler();
    const runner = state.runner as TaskRunner;
    const { status, error } = state;

    const isRunning = status === 'running';
    const actionsControl = StatusActionsMap[status];

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

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
                            return alpha(theme.palette.error.main, 0.18);
                        }
                        if (isRunning) {
                            return alpha(theme.palette.secondary.main, 0.18);
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
                primaryTypographyProps={{ sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                primary={`${runner.name}`}
                secondary={
                    <>
                        <Chip label={StatusTextMap[status]} variant="outlined" size="small" component="span" />
                        {state.startTime && !state.endTime && timeFormatter(now - state.startTime)}
                    </>
                }
                secondaryTypographyProps={{
                    sx: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: 2
                    }
                }}
            />

            {isRunning && (
                <Stack sx={{ width: '100%', overflow: 'hidden' }}>
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
                        prompt={`进度`}
                        labelPosition="top-center"
                        progress={runner.meta.maxTimes - runner.data.remainingTimes}
                        total={runner.meta.maxTimes}
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
                            {timeFormatter(state.endTime! - state.startTime!)} <SwordLine />
                            {state.battleCount}
                        </>
                    }
                    secondaryTypographyProps={{
                        sx: {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 2
                        }
                    }}
                />
            )}

            <IconButton
                title="详情"
                size="small"
                onClick={() => {
                    setDialogOpen(true);
                }}
            >
                <FeedOutlined fontSize="inherit" />
            </IconButton>

            {actionsControl.stop && (
                <IconButton title="停止" size="small" onClick={stopCurrentRunner}>
                    <Stop fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.retry && (
                <IconButton
                    title="重试"
                    size="small"
                    onClick={() => {
                        dequeue(runner);
                        enqueue(runner);
                    }}
                >
                    <RestartAlt fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.del && (
                <IconButton title="删除" size="small" color="error" onClick={() => dequeue(runner)}>
                    <Delete fontSize="inherit" />
                </IconButton>
            )}
            <RunnerDetailDialog close={() => setDialogOpen(false)} open={dialogOpen} runnerState={state} />
        </ListItem>
    );
}

export function LevelStateList(listProps: ListProps) {
    const { queue } = useTaskScheduler();
    return (
        <>
            <List {...listProps}>
                {queue.map((state, index) => {
                    return <TaskStateListItem key={index} state={state} />;
                })}
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

export interface RunnerDetailDialogProps {
    open: boolean;
    close(): void;
    runnerState: TaskState;
}

function RunnerDetailDialog({ open, close, runnerState }: RunnerDetailDialogProps) {
    const { fonts } = useTheme();
    return (
        <Dialog
            open={open}
            onClose={close}
            scroll="paper"
            fullWidth
            sx={{
                '& .MuiPaper-root[role="dialog"]': {
                    backgroundImage: 'none',
                    bgcolor: ({ palette }) => alpha(palette.popup.background, 0.88),
                    minWidth: '18rem',
                    maxWidth: '60vw'
                }
            }}
        >
            <DialogTitle>Runner详情</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={close}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8
                }}
            >
                <Close />
            </IconButton>
            <DialogContent>
                <Typography>关卡名称: {runnerState.runner.name}</Typography>
                <Typography>{runnerState.status}</Typography>
                <Typography>
                    时间:
                    {runnerState.endTime && runnerState.startTime
                        ? timePrintFormatter.formatRange(runnerState.startTime, runnerState.endTime)
                        : runnerState.startTime
                          ? timePrintFormatter.format(runnerState.startTime)
                          : '未启动'}
                </Typography>
                <Typography>元数据: {JSON.stringify(runnerState.runner.meta)}</Typography>
                {Boolean(runnerState.error) && (
                    <Paper
                        sx={{
                            bgcolor: (theme) => alpha(theme.palette.background.default, 0.88)
                        }}
                    >
                        ERROR: <Typography fontFamily={fonts.input}>{runnerState.error?.message}</Typography>
                    </Paper>
                )}
                <Typography>RUNNER: </Typography>
                <Paper
                    sx={{
                        bgcolor: (theme) => alpha(theme.palette.background.default, 0.88),
                        overflow: 'auto'
                    }}
                >
                    <TextField
                        id={`runner-snapshot-${runnerState.runner.name}`}
                        multiline
                        aria-readonly
                        InputProps={{
                            readOnly: true,
                            sx: {
                                fontFamily: ['Open Sans', 'Noto Sans SC']
                            }
                        }}
                        fullWidth
                        defaultValue={JSON.stringify(runnerState.runner, undefined, 2)}
                    />
                </Paper>
                <Typography>日志详情: </Typography>
                <Paper
                    sx={{
                        bgcolor: (theme) => alpha(theme.palette.background.default, 0.88)
                    }}
                >
                    <TextField
                        id={`runner-snapshot-${runnerState.runner.name}`}
                        multiline
                        aria-readonly
                        InputProps={{
                            readOnly: true,
                            sx: {
                                fontFamily: fonts.input
                            }
                        }}
                        fullWidth
                        value={runnerState.logs.join('\n')}
                    />
                </Paper>
            </DialogContent>
        </Dialog>
    );
}
