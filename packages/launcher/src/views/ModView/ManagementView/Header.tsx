import { deploymentSelectors, modActions } from '@/features/mod/slice';
import { getCompositeId } from '@/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { Box, Button, alpha } from '@mui/material';

export function Header() {
    const dispatch = useAppDispatch();
    const deployments = useAppSelector(deploymentSelectors.selectAll);
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
                    deployments.forEach((deployment) => {
                        dispatch(modActions.dispose(getCompositeId(deployment)));
                    });
                    deployments.forEach((deployment) => {
                        void dispatch(modActions.deploy(getCompositeId(deployment)));
                    });
                }}
            >
                重载所有模组
            </Button>
        </Box>
    );
}
