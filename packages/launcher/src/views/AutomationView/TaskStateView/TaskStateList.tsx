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

import { DataLoading } from '@/components/DataLoading';
import { SwordLine } from '@/components/icons/SwordLine';
import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { Paper } from '@/components/styled/Paper';
import { taskStore } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { getCompositeId, type ModExportsRef } from '@/features/mod/utils';
import { taskSchedulerActions, type TaskState } from '@/features/taskSchedulerSlice';
import { dateTime2hhmmss, time2mmss } from '@/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Typography,
    alpha,
    type ListProps
} from '@mui/material';
import React, { memo, useCallback, useEffect, useState } from 'react';

const { abortCurrentRunner, dequeue, enqueue } = taskSchedulerActions;

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
    const dispatch = useAppDispatch();
    const { runner, taskRef, status, error } = state;

    const isRunning = status === 'running';
    const actionsControl = StatusActionsMap[status];

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        let timer: number | undefined;
        if (isRunning) {
            timer = window.setInterval(() => {
                setNow(Date.now());
            }, 500);
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
                primaryTypographyProps={{ sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                primary={`#${runner.id} ${runner.name}`}
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

            {runner.data && isRunning && (
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
                <IconButton title="停止" size="small" onClick={() => dispatch(abortCurrentRunner())}>
                    <Stop fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.retry && (
                <IconButton
                    title="重试"
                    size="small"
                    onClick={async () => {
                        await dispatch(dequeue(runner.id));
                        dispatch(enqueue(taskRef, state.options));
                    }}
                >
                    <RestartAlt fontSize="inherit" />
                </IconButton>
            )}
            {actionsControl.del && (
                <IconButton title="删除" size="small" color="error" onClick={() => dispatch(dequeue(runner.id))}>
                    <Delete fontSize="inherit" />
                </IconButton>
            )}
            <RunnerDetailDialog close={handleCloseDialog} open={dialogOpen} taskState={state} taskRef={taskRef} />
        </ListItem>
    );
}

export function LevelStateList(listProps: ListProps) {
    const queue = useAppSelector((state) => state.taskScheduler.queue);
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

export interface RunnerDetailDialogProps {
    open: boolean;
    close(): void;
    taskState: TaskState;
    taskRef: ModExportsRef;
}

const RunnerDetailDialog = memo(function RunnerDetailDialog({
    open,
    close,
    taskState,
    taskRef
}: RunnerDetailDialogProps) {
    const task = useMapToStore(() => taskRef, taskStore);

    if (!task) {
        return <DataLoading error="无效的任务引用" />;
    }

    const FieldPaper = ({ data, title, id }: { title: string; id: string; data: string }) => (
        <div>
            <InputLabel
                sx={{
                    width: 'fit-content',
                    px: 4,
                    mb: 2,
                    bgcolor: ({ palette }) => alpha(palette.background.paper, 0.12),
                    borderRadius: 1,
                    fontFamily: ({ fonts }) => fonts.input,
                    fontSize: '1.25rem',
                    color: ({ palette }) => palette.text.primary
                }}
                htmlFor={`runner-${id}-${task.metadata.name}`}
            >
                {title}:{' '}
            </InputLabel>
            <Paper>
                <TextField
                    key={`runner-${id}-${task.metadata.name}`}
                    id={`runner-${id}-${task.metadata.name}`}
                    multiline
                    aria-readonly
                    InputProps={{
                        readOnly: true,
                        sx: {
                            fontFamily: ({ fonts }) => fonts.input
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
                    bgcolor: ({ palette }) => palette.popup.background,
                    backdropFilter: 'blur(4px)',
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
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.24),
                                borderRadius: 2
                            }}
                        >
                            {taskState.runner.name}
                        </Typography>
                        <Chip label={taskState.status} variant="outlined" size="small" />
                    </Stack>

                    <Typography>
                        时间:{' '}
                        {taskState.endTime && taskState.startTime
                            ? dateTime2hhmmss.formatRange(taskState.startTime, taskState.endTime)
                            : taskState.startTime
                              ? dateTime2hhmmss.format(taskState.startTime)
                              : '未启动'}
                    </Typography>
                    <Typography sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                        {task.metadata.id} - {task.metadata.name} -{' '}
                        {getCompositeId({ id: taskRef.modId, scope: taskRef.modScope })}
                    </Typography>

                    {Boolean(taskState.error) && (
                        <Paper
                            sx={{
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.36)
                            }}
                        >
                            ERROR:
                            <Typography sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                                {taskState.error?.message}
                            </Typography>
                        </Paper>
                    )}

                    {taskState.options && (
                        <FieldPaper data={JSON.stringify(taskState.options, undefined, 2)} id="options" title="选项" />
                    )}
                    {taskState.runner.data && (
                        <FieldPaper data={JSON.stringify(taskState.runner.data, undefined, 2)} id="data" title="数据" />
                    )}
                    {taskState.logs.length > 0 && <FieldPaper data={taskState.logs.join('\n')} id="log" title="日志" />}
                </Stack>
            </DialogContent>
        </Dialog>
    );
});
