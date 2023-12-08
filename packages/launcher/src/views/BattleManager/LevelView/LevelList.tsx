import { useModStore } from '@/context/useModStore';
import type { LevelInstance } from '@/service/store/level';
import { List, ListItem, ListItemButton, ListItemText, Typography, alpha, type ListProps } from '@mui/material';
import React from 'react';

interface levelListItemProps {
    level: LevelInstance;
}

export function LevelListItem({ level }: levelListItemProps) {
    const { ownerMod, level: _level, name, id } = level;
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
                {ownerMod} {id}
            </Typography>
        </>
    );
    return (
        <ListItem>
            <ListItemButton
                sx={{ height: '72px', border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}
                onClick={() => {
                    console.log(level);
                }}
            >
                <ListItemText primary={title} secondary={description} />
            </ListItemButton>
        </ListItem>
    );
}

export function LevelList(listProps: ListProps) {
    const { levelStore: _store } = useModStore();
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
            {store.map((level) => {
                return <LevelListItem key={level.name} level={level} />;
            })}
        </List>
    );
}
