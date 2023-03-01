import { Button, Divider } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

export function QuickCommand() {
    return (
        <Box>
            <Button
                variant="outlined"
                onClick={() => {
                    eval('ModuleManager.currModule.hide()');
                }}
            >
                关闭主页(挂机模式)
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                    eval('ModuleManager.currModule.show()');
                }}
            >
                开启主页(恢复)
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                    eval('ModuleManager.CloseAll()');
                }}
            >
                返回主页(关闭所有模块)
            </Button>
        </Box>
    );
}
