import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Medication from '@mui/icons-material/Medication';
import MenuOpen from '@mui/icons-material/MenuOpen';
import ScheduleSend from '@mui/icons-material/ScheduleSend';
import { SpeedDialAction, SvgIcon } from '@mui/material';
import useSWR from 'swr';

import React, { useState } from 'react';

import { ModStore } from '@sa-app/ModManager';
import { SaQuickAccess } from '@sa-app/components/styled/QuickAccess';
import { getAutoCureState, toggleAutoCure } from 'sa-core';
import { QuickAccessPlugin, SAModType } from './ModManager/type';

const SvgMaker = ({ url, ...rest }: React.SVGProps<SVGSVGElement> & { url: string }) => {
    const ref = React.useRef<SVGSVGElement>(null);
    React.useEffect(() => {
        if (!url.startsWith('data:image/svg+xml;')) {
            throw new Error('不是有效的svg信息');
        }
        const svg = url.slice('data:image/svg+xml;'.length);
        // 删除base64头
        const base64 = svg.slice(svg.indexOf(',') + 1);
        const svgXml = atob(base64);
        // 解析里面的path
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgXml, 'image/svg+xml');
        if (ref.current) {
            ref.current.innerHTML = doc.getElementsByTagName('svg').item(0)!.innerHTML;
        }
    }, [url]);
    return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" {...rest}></svg>;
};

const SvgWrapper = (url: string) => {
    return (props: React.SVGProps<SVGSVGElement>) => SvgMaker({ url, ...props });
};

export function QuickAccess() {
    const mods = Array.from(ModStore)
        .filter(([_, mod]) => {
            return mod.meta.type === SAModType.QUICK_ACCESS_PLUGIN;
        })
        .map(([_, mod]) => mod as QuickAccessPlugin);
    const actions = [
        { icon: <Medication />, name: '自动治疗' },
        {
            icon: <SvgIcon component={SvgWrapper(mods[0].icon)} inheritViewBox></SvgIcon>,
            name: mods[0].show?.() ?? mods[0].meta.id,
        },
        { icon: <AssignmentInd />, name: '一键签到' },
        { icon: <ScheduleSend />, name: '一键战队派遣' },
    ];

    const { data: autoCure, mutate } = useSWR('ds://MultiValue/AutoCure', getAutoCureState);
    const [open, setOpen] = useState(false);

    actions[0].name = `自动治疗:${autoCure ? '开' : '关'}`;

    const handleClicks = [
        () => {
            mutate((preState) => {
                const curState = !preState;
                toggleAutoCure(curState);
                return preState;
            });
        },
        () => {
            mods[0].click();
        },
        () => {
            ModStore.get('sign')!.reflect('run');
        },
        () => {
            ModStore.get('sign')!.reflect('teamDispatch');
        },
    ];

    return (
        <SaQuickAccess
            ariaLabel="Seerh5 Assistant Quick Access"
            icon={<MenuOpen />}
            direction="right"
            sx={{
                position: 'absolute',
                bottom: '8vh',
                left: '4vw',
            }}
            FabProps={{
                sx: {
                    color: (theme) => theme.palette.primary.main,
                },
            }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={(_, reason) => {
                if (reason !== 'blur') {
                    setOpen(false);
                }
            }}
        >
            {actions.map((action, index) => (
                <SpeedDialAction
                    key={index}
                    FabProps={{
                        sx: {
                            color: (theme) => theme.palette.primary.main,
                        },
                    }}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => {
                        handleClicks[index](), setOpen(true);
                    }}
                />
            ))}
        </SaQuickAccess>
    );
}
