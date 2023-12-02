import * as SEAEndpoint from '@/service/endpoints';
import { Button } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { PetDataManger, PetPosition } from 'sea-core';

export function QuickCommand() {
    return (
        <Box>
            <Button
                variant="outlined"
                onClick={() => {
                    ModuleManager.currModule.hide();
                }}
            >
                关闭主页(挂机模式)
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                    ModuleManager.currModule.show();
                }}
            >
                开启主页(恢复)
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                    ModuleManager.CloseAll();
                }}
            >
                返回主页(关闭所有模块)
            </Button>
            <Button
                variant="outlined"
                onClick={async () => {
                    const data1 = await PetDataManger.miniInfo.get();
                    const data2 = await PetDataManger.bag.get();
                    const petMap = new Map<string, number>();
                    const mapping = (v: { name: string; catchTime: number; id: number; level: number }) => {
                        petMap.set(v.name, v.catchTime);
                    };
                    Array.from(data1)
                        .filter(([_, v]) => v.posi === PetPosition.elite || (v.level === 100 && v.id >= 3582))
                        .map(([_, v]) => v)
                        .forEach(mapping);
                    data2[0].forEach(mapping);
                    data2[1].forEach(mapping);
                    SEAEndpoint.cacheCatchTime(petMap);
                }}
            >
                dump ct(实验性功能)
            </Button>
            <Button onClick={async () => {}}>测试专用</Button>
        </Box>
    );
}
