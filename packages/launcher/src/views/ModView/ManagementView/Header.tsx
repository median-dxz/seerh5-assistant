import { mod } from '@/features/mod';
import { getCompositeId, useAppDispatch } from '@/shared';
import { Box, Button, alpha } from '@mui/material';

export function Header() {
    const dispatch = useAppDispatch();
    const deployments = mod.useDeployments();
    return (
        <Box
            sx={{
                display: 'flex',
                height: '56px',
                width: '100%',
                justifyContent: 'space-evenly',
                padding: '0 16px',
                alignItems: 'center',
                borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.12)}`
            }}
        >
            <Button
                onClick={() => {
                    deployments.forEach((deployment) => dispatch(mod.dispose(getCompositeId(deployment))));
                    deployments.forEach((deployment) => {
                        void dispatch(mod.deploy(getCompositeId(deployment)));
                    });
                }}
            >
                重载所有模组
            </Button>
        </Box>
    );
}
