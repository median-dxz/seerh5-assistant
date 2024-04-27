import { useModStore } from '@/context/useModStore';
import { fetchMods, install, setup, teardown } from '@/service/store/mod';
import CloudUpload from '@mui/icons-material/CloudUploadRounded';
import { Box, Button, alpha, styled } from '@mui/material';
import { useRef } from 'react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
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
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUpload />}
                onClick={() => {
                    if (fileInputRef.current?.files) {
                        install(fileInputRef.current.files);
                    }
                }}
            >
                从文件安装
                <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    name="upload-mod"
                    accept="application/json, application/javascript"
                />
            </Button>
            <Button
                onClick={() => {
                    teardown();
                    fetchMods().then((mods) => {
                        mods.forEach((mod) => {
                            setup(mod);
                        });
                        sync();
                    });
                }}
            >
                重载所有模组
            </Button>
        </Box>
    );
}
