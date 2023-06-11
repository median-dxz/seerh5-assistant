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
            sx={{
                ['&	.MuiBackdrop-root']: {
                    backgroundColor: 'transparent',
                },
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
