import type { ButtonProps, MenuItemProps, MenuProps } from '@mui/material';
import { Button, CircularProgress, Menu, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useListDerivedValue, usePopupState } from '@/shared';

const SUFFIX = 'item-menu';

const Spinner = (
    <Typography sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <CircularProgress size="1.5rem" />
    </Typography>
);

export interface PopupMenuButtonProps<T> {
    id?: string;
    children?: React.ReactNode;
    data?: T[] | (() => Promise<T[]>);
    dataKey?: string;
    onSelectItem?: (item: T, index: number) => void;
    buttonProps?: ButtonProps;
    listItemProps?: MenuItemProps;
    menuProps?: Omit<MenuProps, 'open' | 'onClose' | 'onClick'>;
    renderItem: (props: { index: number; item: T }) => React.ReactNode;
}

export function PopupMenuButton<T>({
    id,
    children,
    data: _data,
    onSelectItem,
    renderItem,
    buttonProps,
    menuProps,
    listItemProps
}: PopupMenuButtonProps<T>) {
    const [data, setData] = useState<T[] | null>(null);

    const loadData = useCallback(async () => {
        let data: T[] | null = [];

        if (typeof _data === 'function') {
            data = await _data();
        } else if (Array.isArray(_data)) {
            data = _data;
        } else {
            data = null;
        }

        setData(data);
        return data;
    }, [_data]);

    const { state, close, open } = usePopupState({
        popupId: id && `${id}-${SUFFIX}`,
        async onOpen(e) {
            buttonProps?.onClick?.(e);
            if (!data?.length) {
                const r = await loadData();
                return Boolean(r?.length);
            }
        }
    });

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handlerClickItem = useCallback(
        (item: T, index: number) => () => {
            onSelectItem?.(item, index);
            close();
        },
        [onSelectItem, close]
    );

    const doRenderItem = useCallback((item: T, index: number) => renderItem({ item, index }), [renderItem]);
    const renderItemCache = useListDerivedValue(data ?? [], doRenderItem);

    return (
        <>
            <Button onClick={open} endIcon={data === null ? Spinner : null} {...buttonProps}>
                {children}
            </Button>
            {data && data.length > 0 && (
                <Menu {...state} {...menuProps} sx={{ ...menuProps?.sx, maxHeight: '60vh' }}>
                    {data.map((item, index) => (
                        <MenuItem
                            key={index}
                            sx={{ maxWidth: '25vw' }}
                            onClick={handlerClickItem(item, index)}
                            {...listItemProps}
                        >
                            {renderItemCache.current.get(item)}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </>
    );
}
