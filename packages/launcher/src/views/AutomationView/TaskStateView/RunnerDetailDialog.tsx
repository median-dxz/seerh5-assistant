import Close from '@mui/icons-material/Close';

import { ModStore, type ModExportsRef } from '@/features/mod';
import type { TaskState } from '@/features/taskScheduler';
import {
    alpha,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputLabel,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';

export interface RunnerDetailDialogProps {
    open: boolean;
    close(): void;
    taskState: TaskState;
    taskRef: ModExportsRef;
}

export const RunnerDetailDialog = React.memo(function RunnerDetailDialog({
    open,
    close,
    taskState,
    taskRef
}: RunnerDetailDialogProps) {
    const task = ModStore.getTask(taskRef)!;
    if (!task) return null;

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
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={close}
            scroll="paper"
            fullWidth
            PaperProps={{ sx: { minWidth: '18rem', maxWidth: '60vw' } }}
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
                                bgcolor: ({ palette }) => alpha(palette.background.paper, 0.24),
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
                            ? `${dayjs(taskState.startTime).format('HH:mm:ss')} - ${dayjs(taskState.endTime).format('HH:mm:ss')}`
                            : taskState.startTime
                              ? dayjs(taskState.startTime).format('HH:mm:ss')
                              : '未启动'}
                    </Typography>
                    <Typography sx={{ fontFamily: ({ fonts }) => fonts.input }}>
                        {task.metadata.id} - {task.metadata.name} - {taskRef.cid}
                    </Typography>

                    {Boolean(taskState.error) && (
                        <Paper
                            sx={{
                                bgcolor: ({ palette }) => alpha(palette.background.paper, 0.36),
                                p: 4
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
