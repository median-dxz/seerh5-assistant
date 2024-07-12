import { useModStore } from '@/context/useModStore';
import { deploymentHandlers, fetchList } from '@/services/modStore/deploymentHandlerSlice';
import { Box, Button, alpha } from '@mui/material';
import React from 'react';

export function Header() {
    const { modStore: store, sync } = useModStore();
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
                    store.forEach((mod) => {
                        try {
                            store.delete(mod.namespace);
                            mod.dispose();
                            console.log(`撤销模组部署: ${mod.namespace}`);
                        } catch (error) {
                            console.error(`撤销模组部署失败: ${mod.namespace}`, error);
                        }
                    });
                    void fetchList()
                        .then(() =>
                            Promise.all(
                                deploymentHandlers.map((handler) => handler.fetch().then(() => handler.deploy()))
                            )
                        )
                        .then(sync);
                }}
            >
                重载所有模组
            </Button>
        </Box>
    );
}
