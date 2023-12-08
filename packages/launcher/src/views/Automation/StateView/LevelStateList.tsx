import { LabeledLinearProgress } from '@/components/LabeledProgress';
import { useLevelScheduler, type LevelRunnerState } from '@/context/useLevelScheduler';
import { Button, List, ListItem, ListItemText, alpha, type ListProps } from '@mui/material';
import React from 'react';
import type { ILevelRunner, LevelMeta } from 'sea-core';

interface LevelStateListItemProps {
    state: LevelRunnerState;
}

export function LevelStateListItem({ state }: LevelStateListItemProps) {
    const { dequeue } = useLevelScheduler();
    const runner = state.runner as ILevelRunner & { meta: LevelMeta };
    const { status, error: _error } = state;

    const running = status === 'running';

    return (
        <ListItem
            sx={{
                border: (theme) => (running ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}` : ''),
                '&>*': {
                    margin: '0 8px',
                },
            }}
        >
            <ListItemText primary={`${runner.meta.id} ${runner.meta.name}`} secondary={status} />
            {running && (
                <LabeledLinearProgress
                    prompt={`当前进度`}
                    progress={runner.meta.maxTimes - runner.data.remainingTimes}
                    total={runner.meta.maxTimes}
                />
            )}
            <Button
                sx={{ borderRadius: 0, border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}
                onClick={() => dequeue(runner)}
            >
                删除
            </Button>
        </ListItem>
    );
}

export function LevelStateList(listProps: ListProps) {
    const { queue } = useLevelScheduler();
    return (
        <List
            sx={{
                width: '100%',
                paddingTop: '16px',
                paddingLeft: '16px',
            }}
            {...listProps}
        >
            {queue.map((state, index) => {
                return <LevelStateListItem key={index} state={state} />;
            })}
        </List>
    );
}
