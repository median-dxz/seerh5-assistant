import Build from '@mui/icons-material/BuildRounded';
import Delete from '@mui/icons-material/DeleteOutlineRounded';
import Feed from '@mui/icons-material/FeedRounded';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Refresh from '@mui/icons-material/RefreshRounded';
import Settings from '@mui/icons-material/Settings';

import { IconButtonNoRipple } from '@/components/IconButtonNoRipple';

import { SEAConfigForm } from '@/components/SEAConfigForm';
import { mod, ModStore, type ModDeployment } from '@/features/mod';
import { modApi } from '@/services/mod';
import { getCompositeId, usePopupState } from '@/shared';

import {
    alpha,
    Grid,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    styled,
    Tooltip,
    Typography,
    type ListProps
} from '@mui/material';
import NanoClamp from 'nanoclamp';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

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
    const { enqueueSnackbar } = useSnackbar();
    const { state: menuState, open } = usePopupState({
        popupId: 'mod-list-item-menu'
    });

    const [configFormOpen, setConfigFormOpen] = useState(false);

    const { state, scope, id } = deployment;
    const cid = getCompositeId({ scope, id });
    const ins = ModStore.getModIns(deployment.status === 'deployed' ? deployment.deploymentId : '');

    const title = (
        <Stack direction="row" sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ paddingRight: '1rem', fontSize: '1.4rem' }}>{id}</Typography>
            <Typography>v{state.version}</Typography>
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
                xs
                sx={{ fontFamily: ({ fonts }) => fonts.property, textOverflow: 'ellipsis', overflow: 'hidden' }}
                zeroMinWidth
            >
                {cid}
            </Grid>

            <Tooltip title={ins?.metadata.description}>
                <Grid item xs={8} zeroMinWidth>
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
                        预置
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
    // TODO 模组安装时保存schema, 编辑配置独立于部署状态
    const configurable = Boolean(configValues && ins?.metadata.configSchema);

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
                    <Feed />
                </IconButtonNoRipple>
                <IconButtonNoRipple
                    disabled={!configurable}
                    title="配置"
                    onClick={() => {
                        setConfigFormOpen(true);
                    }}
                >
                    <Settings />
                </IconButtonNoRipple>
                <IconButtonNoRipple title="管理" onClick={open}>
                    <Build />
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
            <Menu
                {...menuState}
                MenuListProps={{
                    sx: {
                        maxHeight: '50vh'
                    }
                }}
            >
                <MenuItem sx={{ fontSize: '1rem' }}>
                    <RadioButtonUnchecked sx={{ mr: 2, ml: -1 }} fontSize="inherit" />
                    <Typography fontSize="inherit">启用</Typography>
                </MenuItem>
                <MenuItem sx={{ fontSize: '1rem' }}>
                    <RadioButtonChecked sx={{ mr: 2, ml: -1 }} fontSize="inherit" />
                    <Typography fontSize="inherit">禁用</Typography>
                </MenuItem>
                <MenuItem sx={{ fontSize: '1rem' }}>
                    <Refresh sx={{ mr: 2, ml: -1 }} fontSize="inherit" />
                    <Typography fontSize="inherit">重载</Typography>
                </MenuItem>
                <MenuItem sx={{ fontSize: '1rem' }}>
                    <Delete sx={{ mr: 2, ml: -1 }} fontSize="inherit" />
                    <Typography fontSize="inherit">卸载</Typography>
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
