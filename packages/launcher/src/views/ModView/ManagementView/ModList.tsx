import { List, ListItem, ListItemText, Menu, MenuItem, Typography, alpha, type ListProps } from '@mui/material';
import React, { useState, type MouseEventHandler } from 'react';

import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { useModStore } from '@/context/useModStore';
import type { ModInstance } from '@/services/modStore/mod';

import Build from '@mui/icons-material/BuildRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import Feed from '@mui/icons-material/FeedRounded';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Refresh from '@mui/icons-material/RefreshRounded';
import Settings from '@mui/icons-material/Settings';
import { Box } from '@mui/system';

interface ModListItemProps {
    mod: ModInstance;
}

export function ModListItem({ mod }: ModListItemProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        const target = e.currentTarget;
        setAnchor(target);
    };

    const handleCloseMenu = React.useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);

    const open = Boolean(anchor);

    const {
        ctx: { meta },
        namespace
    } = mod;
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
            <Typography component="span" fontSize={16} sx={{ paddingRight: '1em' }}>
                {namespace} {meta.description}
            </Typography>

            {meta.scope === 'builtin' && (
                <Typography sx={{ pr: 1 }} component="span" color="GrayText" fontSize={16}>
                    预置
                </Typography>
            )}
            {meta.preload && (
                <Typography component="span" color="GrayText" fontSize={16}>
                    预加载
                </Typography>
            )}
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.strategies.length ? `策略: ${mod.strategies.length}` : ''}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.battles.length ? `战斗: ${mod.battles.length}` : ''}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.tasks.length ? `关卡: ${mod.tasks.length}` : ''}
            </Typography>
            <Typography component="span" color="GrayText" sx={{ float: 'right' }} fontSize={16}>
                {mod.commands.length ? `命令: ${mod.commands.length}` : ''}
            </Typography>
        </>
    );
    return (
        <ListItem
            sx={{
                transition: (theme) => theme.transitions.create(['background-color']),
                borderRadius: '6px',
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                    backgroundColor: (theme) =>
                        // if (error) {
                        //     return alpha(theme.palette.error.main, 0.18);
                        // }
                        alpha(theme.palette.primary.main, 0.12)
                }
            }}
        >
            <ListItemText
                primary={title}
                secondary={description}
                primaryTypographyProps={{ fontFamily: ['Open Sans', 'MFShangHei'] }}
                sx={{ paddingRight: 4, paddingLeft: 4 }}
            />
            <Box
                sx={{
                    marginInline: '2rem',
                    '&>*': {
                        marginInline: '0.5rem'
                    }
                }}
            >
                <IconButtonNoRipple
                    title="详情"
                    onClick={() => {
                        console.log(mod);
                        //TODO open mod detail
                    }}
                >
                    <Feed />
                </IconButtonNoRipple>
                <IconButtonNoRipple title="配置">
                    <Settings />
                </IconButtonNoRipple>
                <IconButtonNoRipple title="管理" onClick={handleClick}>
                    <Build />
                </IconButtonNoRipple>
            </Box>
            <Menu
                anchorEl={anchor}
                MenuListProps={{
                    sx: {
                        maxHeight: '50vh',
                        overflowY: 'auto',
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.88)
                    }
                }}
                open={open}
                onClose={handleCloseMenu}
            >
                <MenuItem sx={{ maxWidth: '25vw', fontSize: '1rem' }}>
                    <RadioButtonUnchecked fontSize="inherit" />
                    <Typography sx={{ ml: 2, mr: 2 }} fontSize="inherit">
                        启用
                    </Typography>
                </MenuItem>
                <MenuItem sx={{ maxWidth: '25vw', fontSize: '1rem' }}>
                    <RadioButtonChecked fontSize="inherit" />
                    <Typography sx={{ ml: 2, mr: 2 }} fontSize="inherit">
                        禁用
                    </Typography>
                </MenuItem>
                <MenuItem sx={{ maxWidth: '25vw', fontSize: '1rem' }}>
                    <Refresh fontSize="inherit" />
                    <Typography sx={{ ml: 2, mr: 2 }} fontSize="inherit">
                        重载
                    </Typography>
                </MenuItem>
                <MenuItem sx={{ maxWidth: '25vw', fontSize: '1rem' }}>
                    <Delete fontSize="inherit" />
                    <Typography sx={{ ml: 2, mr: 2 }} fontSize="inherit">
                        卸载
                    </Typography>
                </MenuItem>
            </Menu>
        </ListItem>
    );
}

export function ModList(listProps: ListProps) {
    const { modStore: _store } = useModStore();
    const store = Array.from(_store.values());
    return (
        <List
            sx={{ width: '100%', overflow: 'auto', paddingRight: 1, '& > *:not(:first-child)': { marginTop: '8px' } }}
            {...listProps}
        >
            {store.map((mod) => (
                <ModListItem key={mod.ctx.meta.id} mod={mod} />
            ))}
        </List>
    );
}
