import MenuOpen from '@mui/icons-material/MenuOpen';
import { SpeedDialAction, SvgIcon, type SpeedDialActionProps, type SpeedDialProps } from '@mui/material';
import { useState, type SVGProps } from 'react';
import { shallowEqual } from 'react-redux';

import type { AnyFunction } from '@sea/core';

import { SeaQuickAccess } from '@/components/QuickAccess';
import { mod, ModStore, type ModExportsRef } from '@/features/mod';
import { useAppSelector } from '@/shared';

const SvgMaker = ({ url, children: _, ...rest }: SVGProps<SVGSVGElement> & { url: string }) => {
    if (!url.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')) {
        throw new Error('不是有效的svg信息');
    }
    const svgXml = url;
    // 解析里面的path
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgXml, 'image/svg+xml');
    const svgPaths = doc.getElementsByTagName('svg').item(0)!.innerHTML;
    // console.log(`[QuickAccessPlugin]: 请检查svg信息: ${svgPaths}`);
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{ __html: svgPaths }}
            {...rest}
        />
    );
};

const SvgWrapper = (url: string) => (props: SVGProps<SVGSVGElement>) => SvgMaker({ url, ...props });

const QuickAccessPluginAction = ({
    pluginRef,
    setOpen,
    FabProps,
    ...rest
}: {
    pluginRef: ModExportsRef;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & SpeedDialActionProps) => {
    const plugin = ModStore.getCommand(pluginRef)!;

    const getTitle = () => {
        if (plugin.description) {
            if (typeof plugin.description === 'string') {
                return plugin.description;
            } else {
                return (plugin.description as AnyFunction)() as string;
            }
        } else {
            return plugin.name;
        }
    };

    const [title, setTitle] = useState(getTitle);

    return (
        <SpeedDialAction
            FabProps={{
                ...FabProps,
                disableFocusRipple: true,
                disableTouchRipple: true,
                sx: {
                    color: (theme) => theme.palette.primary.main
                }
            }}
            icon={<SvgIcon component={SvgWrapper(plugin.icon!)} inheritViewBox></SvgIcon>}
            tooltipTitle={title}
            onClick={() => {
                const r = plugin.handler();

                if (r instanceof Promise) {
                    void r.then(() => {
                        setTitle(getTitle());
                    });
                } else {
                    setTitle(getTitle());
                }

                setOpen(true);
            }}
            {...rest}
        />
    );
};

export function QuickAccess(props: SpeedDialProps) {
    const [open, setOpen] = useState(false);

    const refs = useAppSelector(
        (state) => mod.commandRefs(state).filter((ref) => ModStore.getCommand(ref)?.icon),
        shallowEqual
    );

    return (
        <SeaQuickAccess
            icon={<MenuOpen />}
            direction="right"
            FabProps={{
                disableRipple: true,
                disableFocusRipple: true,
                sx: {
                    color: 'primary.main'
                }
            }}
            open={open}
            onOpen={(evt, reason) => {
                if (reason === 'toggle') {
                    setOpen(true);
                }
            }}
            onClose={(_, reason) => {
                if (reason === 'toggle') {
                    setOpen(false);
                }
            }}
            {...props}
        >
            {refs.map((ref) => (
                <QuickAccessPluginAction key={JSON.stringify(ref)} pluginRef={ref} setOpen={setOpen} />
            ))}
        </SeaQuickAccess>
    );
}
