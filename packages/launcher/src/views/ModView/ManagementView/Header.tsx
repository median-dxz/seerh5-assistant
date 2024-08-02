import { mod } from '@/features/mod';
import { getCompositeId, useAppDispatch } from '@/shared';
import { Button, Toolbar, alpha } from '@mui/material';

export function Header() {
    const dispatch = useAppDispatch();
    const deployments = mod.useDeployments();
    return (
        <Toolbar
            sx={{
                borderBottom: ({ palette }) => `1px solid ${alpha(palette.divider, 0.12)}`
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
        </Toolbar>
    );
}
