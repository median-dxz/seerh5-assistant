import Build from '@mui/icons-material/BuildRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import Feed from '@mui/icons-material/FeedRounded';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Refresh from '@mui/icons-material/RefreshRounded';
import Settings from '@mui/icons-material/Settings';
import SwapVert from '@mui/icons-material/SwapVert';

import {
    alpha,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem as MuiMenuItem,
    Stack,
    styled,
    Tooltip,
    Typography,
    type ListProps
} from '@mui/material';
import NanoClamp from 'nanoclamp';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';
import { SEAConfigForm } from '@/components/SEAConfigForm';
import { mod, ModStore, type ModDeployment } from '@/features/mod';
import { modApi } from '@/services/mod';
import { getCompositeId, useAppDispatch, usePopupState } from '@/shared';

const ClampText = styled(NanoClamp)(({ theme }) => ({
    ...theme.typography.button,
    fontSize: '1rem',
    fontFamily: theme.fonts.input,
    margin: 0
}));

const MenuItem = styled(MuiMenuItem)`
    font-size: 1rem;
    & :first-child {
        margin-left: -4px;
        margin-right: 8px;
    }
`;

interface ModListItemProps {
    deployment: ModDeployment;
}

export function ModListItem({ deployment }: ModListItemProps) {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useAppDispatch();
    const [uninstall] = modApi.useUninstallMutation();
    const [configFormOpen, setConfigFormOpen] = useState(false);

    const { state, scope, id } = deployment;
    const cid = getCompositeId({ scope, id });
    const ins = ModStore.getModIns(deployment.status === 'deployed' ? deployment.deploymentId : '');

    const title = (
        <Stack direction="row" sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: '1.4rem' }}>{id}</Typography>
            <Chip label={`v${state.version}`} />
        </Stack>
    );

    const description = (
        <Grid
            container
            spacing={1}
            columns={16}
            sx={{ justifyContent: 'flex-start', alignItems: 'baseline', fontSize: '1rem' }}
        >
            <Grid
                item
                xs={4}
                sx={{ fontFamily: ({ fonts }) => fonts.property, textOverflow: 'ellipsis', overflow: 'hidden' }}
                zeroMinWidth
            >
                {scope}
            </Grid>

            <Tooltip title={ins?.metadata.description}>
                <Grid item xs zeroMinWidth>
                    <ClampText
                        is="p"
                        lines={1}
                        debounce={100}
                        accessibility={false}
                        text={ins?.metadata.description ?? ''}
                    />
                </Grid>
            </Tooltip>

            {scope === 'builtin' && (
                <Grid item xs={2} sx={{ alignSelf: 'flex-end' }}>
                    <Typography color="GrayText" variant="inherit" noWrap>
                        内置
                    </Typography>
                </Grid>
            )}
            {state.preload && (
                <Grid item xs={2} sx={{ alignSelf: 'flex-end' }}>
                    <Typography color="GrayText" variant="inherit" noWrap>
                        预加载
                    </Typography>
                </Grid>
            )}

            <Grid item xs={2} sx={{ alignSelf: 'flex-end' }}>
                <Typography color="GrayText" variant="inherit" noWrap>
                    {deployment.status === 'deployed' ? '已部署' : deployment.isDeploying ? '部署中...' : '未部署'}
                </Typography>
            </Grid>
        </Grid>
    );

    const { data: configValues } = modApi.useConfigQuery(cid);
    const [updateConfig] = modApi.useSetConfigMutation();
    const configurable = Boolean(configValues && ins?.metadata.configSchema);

    const { state: menuState, open } = usePopupState({
        popupId: 'mod-list-item-menu'
    });

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
                },
                justifyContent: 'space-between',
                px: 8
            }}
        >
            <ListItemText primary={title} secondary={description} disableTypography sx={{ width: '70%' }} />
            <Stack direction="row">
                <IconButtonNoRipple
                    title="详情"
                    onClick={() => {
                        // TODO open mod detail
                        // available in status === 'deployed'
                    }}
                >
                    <Feed fontSize="small" />
                </IconButtonNoRipple>
                <IconButtonNoRipple
                    disabled={!configurable}
                    title="配置"
                    onClick={() => {
                        setConfigFormOpen(true);
                    }}
                >
                    <Settings fontSize="small" />
                </IconButtonNoRipple>
                <IconButtonNoRipple title="管理" disabled={state.builtin} onClick={open}>
                    <Build fontSize="small" />
                </IconButtonNoRipple>
            </Stack>
            {configurable && (
                <SEAConfigForm
                    open={configFormOpen}
                    onClose={() => {
                        setConfigFormOpen(false);
                    }}
                    onSubmit={async (payload) => {
                        await updateConfig({ data: payload, compositeId: cid });
                        enqueueSnackbar('配置已更新, 重载模组以应用更改', { variant: 'success' });
                    }}
                    title={`模组配置: ${ins!.compositeId}`}
                    schema={ins!.metadata.configSchema!}
                    values={configValues!}
                />
            )}
            <Menu {...menuState}>
                <MenuItem>
                    {state.enable ? (
                        <RadioButtonUnchecked fontSize="inherit" />
                    ) : (
                        <RadioButtonChecked fontSize="inherit" />
                    )}
                    <Typography variant="inherit">{state.enable ? '禁用' : '启用'}</Typography>
                </MenuItem>
                <MenuItem>
                    <SwapVert fontSize="inherit" />
                    <Typography variant="inherit">加载优先级</Typography>
                </MenuItem>
                <MenuItem>
                    <Refresh fontSize="inherit" />
                    <Typography variant="inherit">重载</Typography>
                </MenuItem>
                <MenuItem
                    onClick={async () => {
                        try {
                            dispatch(mod.dispose(cid));
                            await uninstall(cid);
                            enqueueSnackbar('模组已卸载', { variant: 'success' });
                        } catch (error) {
                            console.error(error);
                            enqueueSnackbar('卸载失败', { variant: 'error' });
                        }
                    }}
                >
                    <Delete fontSize="inherit" />
                    <Typography variant="inherit">卸载</Typography>
                </MenuItem>
            </Menu>
        </ListItem>
    );
}

export function ModList(listProps: ListProps) {
    const deployments = mod.useDeployments();
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
