import { useModStore } from '@/context/useModStore';
import type { ModInstance } from '@/service/store/mod';
import { List, ListItemButton, ListItemText, Typography, alpha, type ListProps } from '@mui/material';
import React from 'react';

interface ModListItemProps {
    mod: ModInstance;
}

export function ModListItem({ mod }: ModListItemProps) {
    const { meta } = mod;
    const title = (
        <>
            <Typography component="span" sx={{ paddingRight: '1em' }} fontSize={24}>
                {meta.id}
            </Typography>
            <Typography component="span">v{meta.version}</Typography>
        </>
    );

    const description = (
        <>
            <Typography component="span" fontSize={16}>
                {meta.namespace} {meta.description}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.strategy.length ? `策略: ${mod.strategy.length}` : ''}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.battle.length ? `战斗: ${mod.battle.length}` : ''}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.level.length ? `关卡: ${mod.level.length}` : ''}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.command.length ? `命令: ${mod.command.length}` : ''}
            </Typography>
        </>
    );
    return (
        <ListItemButton
            sx={{ height: '72px', border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}
            onClick={() => {
                console.log(mod);
                //TODO open mod detail
            }}
        >
            <ListItemText
                primary={title}
                secondary={description}
                primaryTypographyProps={{ fontFamily: ['Open Sans', 'MFShangHei'] }}
            />
        </ListItemButton>
    );
}

export function ModList(listProps: ListProps) {
    const { store: _store } = useModStore();
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
            {store.map((mod) => {
                return <ModListItem key={mod.meta.id} mod={mod} />;
            })}
        </List>
    );
}
