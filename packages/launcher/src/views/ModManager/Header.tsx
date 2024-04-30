import { useModStore } from '@/context/useModStore';
import { deploymentHandlers, fetchList } from '@/service/mod/handler';
import { installModFromUrl } from '@/service/mod/install';
import { teardown } from '@/service/store/mod';
import CloudUpload from '@mui/icons-material/CloudUploadRounded';
import { Box, Button, alpha, styled } from '@mui/material';
import React from 'react';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
});

export function Header() {
    const { sync } = useModStore();

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
            <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUpload />}>
                从文件安装
                <VisuallyHiddenInput
                    type="file"
                    name="upload-mod"
                    accept="text/javascript"
                    onChange={async (v) => {
                        if (v.target.files && v.target.files.length > 0) {
                            const url = URL.createObjectURL(v.target.files[0]);
                            await installModFromUrl(url);
                            URL.revokeObjectURL(url);
                        }
                    }}
                />
            </Button>
            <Button
                onClick={() => {
                    teardown();
                    fetchList()
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
