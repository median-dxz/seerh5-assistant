import React from 'react';
import { OpenPopupMenuOptions, PopupMenuItem, PopupMenuProps } from './PopupMenu';


export function usePopupMenuState<T>() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [options, setOptions] = React.useState<OpenPopupMenuOptions<T>>({
        handler: null,
        data: [],
        displayText: [],
    });

    const openMenu = (anchorEl: HTMLElement | null, options: OpenPopupMenuOptions<T>) => {
        setAnchorEl(anchorEl);
        setOptions(options);
    };

    const open = Boolean(anchorEl);

    const onClose = () => {
        setAnchorEl(null);
    };

    const menuItems: Array<PopupMenuItem> = options.data.map((item, i) => {
        return {
            handler: () => {
                options.handler?.(item, i);
                onClose();
            },
            displayText: options.displayText[i],
        };
    });

    const menuProps: PopupMenuProps = {
        open,
        anchorEl,
        onClose,
        menuItems,
    };

    return [menuProps, openMenu] as const;
}
