import { useModStore } from '@/context/useModStore';
import type { BattleInstance } from '@/service/store/battle';
import { List, ListItemButton, ListItemText, Typography, alpha, type ListProps } from '@mui/material';
import React from 'react';

interface BattleListItemProps {
    battle: BattleInstance;
}

export function BattleListItem({ battle }: BattleListItemProps) {
    const { ownerMod, pets, strategy, name } = battle;
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
            <Typography component="span" p={1} fontSize={16}>
                {pets.join(', ')}
            </Typography>
            <Typography component="span" sx={{ float: 'right' }}>
                {'>'} {strategy}
            </Typography>
        </>
    );
    return (
        <ListItemButton
            sx={{ height: '72px', border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}
            onClick={() => {
                console.log(battle);
            }}
        >
            <ListItemText primary={title} secondary={description} />
        </ListItemButton>
    );
}

export function BattleList(listProps: ListProps) {
    const { battleStore: _store } = useModStore();
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
            {store.map((battle) => {
                return <BattleListItem key={battle.name} battle={battle} />;
            })}
        </List>
    );
}
