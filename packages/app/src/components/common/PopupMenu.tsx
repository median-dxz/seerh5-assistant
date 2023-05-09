import { Menu, MenuItem, type MenuProps } from '@mui/material';
import React, { type MouseEventHandler } from 'react';

export type PopupMenuItemHandler<T> = (item: T, index: number) => void;

export type OpenPopupMenuOptions<T = any> = {
    handler: PopupMenuItemHandler<T> | null;
    data: T[];
    displayText: string[];
};

export interface PopupMenuItem {
    handler: MouseEventHandler;
    displayText: string;
}

export type PopupMenuProps = {
    menuItems: PopupMenuItem[];
} & MenuProps;

export function PopupMenu(props: PopupMenuProps) {
    const { menuItems, ...menuProps } = props;

    return (
        <Menu
            MenuListProps={{
                role: 'listbox',
            }}
            {...menuProps}
        >
            {menuItems.map((item) => (
                <MenuItem key={JSON.stringify(item)} onClick={item.handler}>
                    {item.displayText}
                </MenuItem>
            ))}
        </Menu>
    );
}

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
