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
import React, { memo, useCallback, useEffect, useState } from 'react';

import { SwordLine } from '@/components/icons/SwordLine';
import { Paper } from '@/components/styled/Paper';
import { dateTime2hhmmss, time2mmss } from '@/shared';
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
import type { Task } from '@sea/mod-type';

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
    const [dialogOpen, setDialogOpen] = useState(false);
    const { dequeue, enqueue, stopCurrentRunner } = useTaskScheduler();
    const { runnerId, runnerData, task } = state;
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
                primaryTypographyProps={{ sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                primary={`#${runnerId + 1} ${task.metadata.name}`}
                secondary={
                    <>
                        <Chip label={StatusTextMap[status]} variant="outlined" size="small" component="span" />
                        {state.startTime && !state.endTime && time2mmss(now - state.startTime)}
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
                        overridePrompt={`${runnerData!.progress}%`}
                        progress={runnerData!.progress}
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
                        progress={task.metadata.maxTimes - runnerData!.remainingTimes}
                        total={task.metadata.maxTimes}
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
                            {time2mmss(state.endTime! - state.startTime!)} <SwordLine />
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
                        dequeue(runnerId);
                        enqueue(task, state.options);
                    }}
                >
                    <RestartAlt fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.del && (
                <IconButton title="删除" size="small" color="error" onClick={() => dequeue(runnerId)}>
                    <Delete fontSize="inherit" />
                </IconButton>
            )}
            <RunnerDetailDialog close={handleCloseDialog} open={dialogOpen} runnerState={state} task={task} />
        </ListItem>
    );
}

export function LevelStateList(listProps: ListProps) {
    const { queue } = useTaskScheduler();
    return (
        <>
            <List {...listProps}>
                {queue.map((state) => (
                    <TaskStateListItem key={state.runnerId} state={state} />
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

export interface RunnerDetailDialogProps {
    open: boolean;
    close(): void;
    runnerState: TaskState;
    task: Task;
}

const RunnerDetailDialog = memo(function RunnerDetailDialog({
    open,
    close,
    runnerState,
    task
}: RunnerDetailDialogProps) {
    const { fonts } = useTheme();
    const FieldPaper = ({ data, title, id }: { title: string; id: string; data: string }) => (
        <div>
            <Typography
                fontSize="1.25rem"
                fontFamily={fonts.input}
                sx={{
                    width: 'fit-content',
                    px: 4,
                    mb: 2,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3),
                    borderRadius: 1
                }}
            >
                {title}:{' '}
            </Typography>
            <Paper>
                <TextField
                    key={`runner-${id}-${task.metadata.name}`}
                    id={`runner-${id}-${task.metadata.name}`}
                    multiline
                    aria-readonly
                    InputProps={{
                        readOnly: true,
                        sx: {
                            fontFamily: fonts.input
                        }
                    }}
                    fullWidth
                    value={data}
                />
            </Paper>
        </div>
    );
    return (
        <Dialog
            open={open}
            onClose={close}
            scroll="paper"
            fullWidth
            sx={{
                '& .MuiPaper-root[role="dialog"]': {
                    backgroundImage: 'none',
                    bgcolor: ({ palette }) => alpha(palette.popup.background, 0.8),
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
                <Stack direction="column" spacing={4}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography
                            fontSize="2rem"
                            sx={{
                                width: 'fit-content',
                                px: 4,
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3),
                                borderRadius: 2
                            }}
                        >
                            {task.metadata.name}
                        </Typography>
                        <Chip label={runnerState.status} variant="outlined" size="small" />
                    </Stack>

                    <Typography>
                        时间:{' '}
                        {runnerState.endTime && runnerState.startTime
                            ? dateTime2hhmmss.formatRange(runnerState.startTime, runnerState.endTime)
                            : runnerState.startTime
                              ? dateTime2hhmmss.format(runnerState.startTime)
                              : '未启动'}
                    </Typography>
                    {Boolean(runnerState.error) && (
                        <Paper
                            sx={{
                                bgcolor: (theme) => alpha(theme.palette.background.default, 0.88)
                            }}
                        >
                            ERROR: <Typography fontFamily={fonts.input}>{runnerState.error?.message}</Typography>
                        </Paper>
                    )}

                    <FieldPaper data={JSON.stringify(task.metadata, undefined, 2)} id="metadata" title="元数据" />
                    {runnerState.options && (
                        <FieldPaper
                            data={JSON.stringify(runnerState.options, undefined, 2)}
                            id="options"
                            title="选项"
                        />
                    )}
                    {runnerState.runnerData && (
                        <FieldPaper
                            data={JSON.stringify(runnerState.runnerData, undefined, 2)}
                            id="data"
                            title="数据"
                        />
                    )}
                    {runnerState.logs.length > 0 && (
                        <FieldPaper data={runnerState.logs.join('\n')} id="log" title="日志" />
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
});
