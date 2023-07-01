import MenuOpen from '@mui/icons-material/MenuOpen';
import { SpeedDialAction, SpeedDialActionProps, SvgIcon } from '@mui/material';
import useSWR from 'swr';

import React, { useState } from 'react';

import { SaQuickAccess } from '@sa-app/components/styled/QuickAccess';
import { ModStore } from '@sa-app/service/ModManager';
import { SAModType, type QuickAccessPlugin } from './service/ModManager/type';

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

const QuickAccessPluginAction: React.FC<
    {
        plugin: QuickAccessPlugin;
        setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    } & SpeedDialActionProps
> = ({ plugin, setOpen, ...rest }) => {
    const fetcher = () => {
        if (plugin.showAsync) {
            return plugin.showAsync();
        } else {
            return plugin.show?.() ?? plugin.meta.id;
        }
    };

    const { data: title, mutate } = useSWR(`ds://mod/quick-access-plugin/${plugin.namespace}`, fetcher);
    return (
        <SpeedDialAction
            FabProps={{
                sx: {
                    color: (theme) => theme.palette.primary.main,
                },
            }}
            icon={<SvgIcon component={SvgWrapper(plugin.icon)} inheritViewBox></SvgIcon>}
            tooltipTitle={title}
            onClick={() => {
                plugin.click();
                if (plugin.showAsync) {
                    mutate(plugin.showAsync);
                }
                setOpen(true);
            }}
            {...rest}
        />
    );
};

export function QuickAccess() {
    const plugins = Array.from(ModStore)
        .filter(([_, mod]) => {
            return mod.meta.type === SAModType.QUICK_ACCESS_PLUGIN;
        })
        .map(([_, mod]) => mod as QuickAccessPlugin);

    const [open, setOpen] = useState(false);

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
            {plugins.map((plugin) => (
                <QuickAccessPluginAction key={plugin.namespace} plugin={plugin} setOpen={setOpen} />
            ))}
        </SaQuickAccess>
    );
}
