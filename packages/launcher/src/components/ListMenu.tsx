import { useListDerivedValue } from '@/shared';
import { Menu, MenuItem, type MenuItemProps, type MenuProps } from '@mui/material';
import * as React from 'react';
import { useCallback } from 'react';

const MemoMenuItem = React.memo(MenuItem);

export type ListMenuProps<T, P> = {
    data?: T[];
    onClick?: (item: T, index: number) => void;
    RenderItem?: React.JSXElementConstructor<P>;
    renderItemProps?: Omit<P, 'index' | 'item'> extends Record<string, unknown> ? Omit<P, 'index' | 'item'> : never;
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    listItemProps?: MenuItemProps;
} & Omit<MenuProps, 'open' | 'onClose' | 'onClick'>;

export function ListMenu<T, P extends object>(props: ListMenuProps<T, P>) {
    const {
        data = [],
        onClick,
        anchorEl = null,
        setAnchor,
        listItemProps,
        MenuListProps: allMenuListProps,
        ...rest
    } = props;
    const { renderItemProps, RenderItem, ...menuProps } = rest as {
        RenderItem?: React.JSXElementConstructor<{ index: number; item: T }>;
        renderItemProps?: object;
    } & Omit<MenuProps, 'open' | 'onClose' | 'onClick'>;

    const { sx: MenuListSx, ...MenuListProps } = allMenuListProps ?? {};
    const open = Boolean(anchorEl);

    const handleCloseMenu = useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);

    const handleClickItem = useCallback(
        (item: T, index: number) => () => {
            onClick?.(item, index);
            setAnchor(null);
        },
        [onClick, setAnchor]
    );

    const onClickRef = useListDerivedValue(data, handleClickItem);

    if (data.length === 0) {
        return null;
    }

    return (
        <Menu
            anchorEl={anchorEl}
            {...menuProps}
            MenuListProps={{
                ...MenuListProps,
                sx: {
                    maxHeight: '50vh',
                    ...MenuListSx
                }
            }}
            open={open}
            onClose={handleCloseMenu}
        >
            {data.map((item, index) => (
                <MemoMenuItem
                    key={index}
                    sx={{ maxWidth: '25vw' }}
                    onClick={onClickRef.current.get(item)}
                    {...listItemProps}
                >
                    {RenderItem ? <RenderItem index={index} item={item} {...renderItemProps} /> : String(item)}
                </MemoMenuItem>
            ))}
        </Menu>
    );
}
