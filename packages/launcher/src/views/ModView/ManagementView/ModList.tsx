import Build from '@mui/icons-material/BuildRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import Feed from '@mui/icons-material/FeedRounded';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Refresh from '@mui/icons-material/RefreshRounded';
import Settings from '@mui/icons-material/Settings';

import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { deploymentSelectors, type ModDeployment } from '@/features/mod/slice';
import { modStore } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import { useAppSelector } from '@/store';
import { getCompositeId } from '@/shared';

import {
    Box,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
    alpha,
    styled,
    type ListProps
} from '@mui/material';
import NanoClamp from 'nanoclamp';
import type { MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';

const ClampText = styled(NanoClamp)(({ theme }) => ({
    ...theme.typography.button,
    fontSize: '1rem',
    fontFamily: theme.fonts.input,
    margin: 0
}));

interface ModListItemProps {
    deployment: ModDeployment;
}

export function ModListItem({ deployment }: ModListItemProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        const target = e.currentTarget;
        setAnchor(target);
    };

    const handleCloseMenu = useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);

    const open = Boolean(anchor);

    const { state, scope, id } = deployment;
    const ins = useMapToStore(() => (deployment.status === 'deployed' ? deployment.deploymentId : undefined), modStore);

    const title = (
        <Stack direction="row" sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ paddingRight: '1rem', fontSize: 28 }}>{id}</Typography>
            <Typography>v{state.version}</Typography>
        </Stack>
    );

    const description = (
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ alignItems: 'baseline' }}>
                <Typography sx={{ fontFamily: ({ fonts }) => fonts.property }}>
                    {getCompositeId({ scope, id })}
                </Typography>

                {ins && (
                    <Tooltip title={ins.metadata.description}>
                        <Box>
                            <ClampText
                                is="p"
                                lines={1}
                                debounce={100}
                                accessibility={false}
                                text={ins.metadata.description}
                            />
                        </Box>
                    </Tooltip>
                )}
            </Stack>
            <Stack direction="row" spacing={4} sx={{ alignItems: 'baseline' }}>
                {scope === 'builtin' && (
                    <Typography color="GrayText" sx={{ fontSize: 16 }}>
                        预置
                    </Typography>
                )}
                {state.preload && (
                    <Typography color="GrayText" sx={{ fontSize: 16 }}>
                        预加载
                    </Typography>
                )}
                <Typography color="GrayText" sx={{ fontSize: 16 }}>
                    {deployment.status === 'deployed' ? '已部署' : deployment.isDeploying ? '部署中...' : '未部署'}
                </Typography>
            </Stack>
        </Stack>
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
                disableTypography
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
                        // TODO open mod detail
                        // available in status === 'deployed'
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
                        maxHeight: '50vh'
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
    const deployments = useAppSelector(deploymentSelectors.selectAll);
    return (
        <List
            sx={{ width: '100%', overflow: 'auto', paddingRight: 1, '& > *:not(:first-child)': { marginTop: '8px' } }}
            {...listProps}
        >
            {deployments.map((deployment) => (
                <ModListItem key={getCompositeId(deployment)} deployment={deployment} />
            ))}
        </List>
    );
}
