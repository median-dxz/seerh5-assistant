import { Button, CircularProgress, alpha } from '@mui/material';
import { useState } from 'react';

import { delay } from '@sea/core';
import { getCompositeId } from '@sea/mod-resolver';

import { Row } from '@/components/Row';
import { mod } from '@/features/mod';
import { modApi } from '@/services/mod';
import { useAppDispatch } from '@/shared';

export function Header() {
    const dispatch = useAppDispatch();
    const deployments = mod.useDeployments();

    const [deploying, setDeploying] = useState(false);
    const [refetch, { isFetching }] = modApi.endpoints.indexList.useLazyQuery();

    return (
        <Row
            sx={{
                pb: 2,
                borderBottom: ({ palette }) => `1px solid ${alpha(palette.divider, 0.12)}`
            }}
            spacing={2}
        >
            <Button
                disabled={isFetching || deploying}
                onClick={() => {
                    void refetch();
                }}
            >
                刷新模组列表
            </Button>
            <Button
                disabled={isFetching || deploying}
                endIcon={deploying && <CircularProgress size="1rem" />}
                onClick={async () => {
                    setDeploying(true);
                    await delay(100);
                    deployments.forEach((deployment) => dispatch(mod.dispose(getCompositeId(deployment))));
                    await Promise.all(
                        deployments.map((deployment) => dispatch(mod.deploy(getCompositeId(deployment))))
                    );
                    setDeploying(false);
                }}
            >
                重载所有模组
            </Button>
        </Row>
    );
}
