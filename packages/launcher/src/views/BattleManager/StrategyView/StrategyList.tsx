import { useModStore } from '@/context/useModStore';
import type { StrategyInstance } from '@/service/store/strategy';
import { List, ListItemButton, ListItemText, Typography, alpha, type ListProps } from '@mui/material';
import React from 'react';

interface StrategyListItemProps {
    strategy: StrategyInstance;
}

export function StrategyListItem({ strategy }: StrategyListItemProps) {
    const { ownerMod, name } = strategy;
    const title = (
        <>
            <Typography component="span" sx={{ paddingRight: '1em' }} fontSize={24}>
                {name}
            </Typography>
        </>
    );

    const description = (
        <>
            <Typography component="span" fontSize={16}>
                {ownerMod}
            </Typography>
        </>
    );
    return (
        <ListItemButton
            sx={{ height: '72px', border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}
            onClick={() => {
                console.log(strategy);
            }}
        >
            <ListItemText primary={title} secondary={description} />
        </ListItemButton>
    );
}

export function StrategyList(listProps: ListProps) {
    const { strategyStore: _store } = useModStore();
    const store = Array.from(_store.values());
    return (
        <List
            sx={{
                width: '100%',
                paddingTop: '16px',
                paddingLeft: '16px',
            }}
            {...listProps}
        >
            {store.map((strategy) => {
                return <StrategyListItem key={strategy.name} strategy={strategy} />;
            })}
        </List>
    );
}
