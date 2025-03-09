import MenuOpen from '@mui/icons-material/MenuOpen';
import { lighten, SpeedDialAction, type SpeedDialActionProps, type SpeedDialProps } from '@mui/material';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SvgWrapper = (url: string) => (props: SVGProps<SVGSVGElement>) => SvgMaker({ url, ...props });

const QuickAccessPluginAction = ({
    pluginRef,
    setOpen,
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
            sx={{
                '& .MuiSpeedDialAction-staticTooltipLabel': {
                    position: 'relative',
                    fontSize: '0.9rem',
                    background: 'none',
                    boxShadow: 'none',
                    transition: ({ transitions }) => transitions.create('all', { duration: 150 }),

                    borderRight: ({ palette }) => `1px solid ${palette.divider}`,
                    borderRadius: 0,
                    px: 4,

                    userSelect: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                        color: ({ palette }) => lighten(palette.primary.main, 0.4),
                        filter: ({ palette }) => `drop-shadow(0 0 4px ${palette.primary.main})`
                    },

                    '&:active': {
                        color: ({ palette }) => palette.primary.main,
                        transform: 'translateY(1px)'
                    }
                },
                '&:first-child': {
                    borderLeft: ({ palette }) => `1px solid ${palette.divider}`
                },
                '&:last-child': {
                    borderRight: 'none'
                },
                '& .MuiFab-root': {
                    position: 'absolute',
                    display: 'none'
                }
            }}
            FabProps={{
                disableFocusRipple: true,
                disableRipple: true,
                disableTouchRipple: true
            }}
            // icon={<SvgIcon component={SvgWrapper(plugin.icon!)} inheritViewBox></SvgIcon>}
            tooltipTitle={title}
            tooltipOpen
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

    let refs: ModExportsRef[] = useAppSelector(
        (state) => mod.commandRefs(state).filter((ref) => ModStore.getCommand(ref)?.icon),
        shallowEqual
    );

    if (!open) {
        refs = [];
    }

    return (
        <SeaQuickAccess
            icon={<MenuOpen />}
            direction="right"
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
            FabProps={{
                disableFocusRipple: true,
                disableRipple: true,
                disableTouchRipple: true
            }}
            {...props}
        >
            {refs.map((ref) => (
                <QuickAccessPluginAction key={JSON.stringify(ref)} pluginRef={ref} setOpen={setOpen} />
            ))}
        </SeaQuickAccess>
    );
}
