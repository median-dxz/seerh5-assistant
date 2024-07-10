import type { ButtonProps, MenuProps } from '@mui/material';
import { Button, CircularProgress, Typography } from '@mui/material';
import React, { useState, type MouseEventHandler } from 'react';
import { ListMenu, type ListMenuProps } from './ListMenu';

const SUFFIX = 'item-menu';

export interface PopupMenuButtonProps<T, P extends object> {
    id?: string;
    children?: React.ReactNode;
    data?: T[] | (() => Promise<T[]>);
    dataKey?: string;
    onSelectItem?: (item: T, index: number) => void;
    buttonProps?: ButtonProps;
    menuProps?: Omit<MenuProps, 'open' | 'onClose' | 'onClick'> &
        Pick<ListMenuProps<T, P>, 'RenderItem' | 'renderItemProps' | 'listItemProps'>;
}

export function PopupMenuButton<T, P extends object>({
    id,
    children,
    data: _data,
    onSelectItem,
    buttonProps,
    menuProps
}: PopupMenuButtonProps<T, P>) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [data, setData] = useState<T[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const Spinner = (
        <Typography sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <CircularProgress size="1.5rem" />
        </Typography>
    );

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        buttonProps?.onClick?.(e);
        const target = e.currentTarget;

        if (typeof _data === 'function') {
            setLoading(true);
            void _data().then((data) => {
                setLoading(false);
                setAnchor(data.length ? target : null);
                setData(data.length ? data : undefined);
            });
        } else if (Array.isArray(_data) && _data.length > 0) {
            setAnchor(target);
            setData(_data);
        } else {
            setAnchor(null);
            setData(undefined);
        }
    };

    return (
        <>
            <Button {...buttonProps} onClick={handleClick} disabled={loading} endIcon={loading ? Spinner : null}>
                {children}
            </Button>
            <ListMenu
                id={id && `${id}-${SUFFIX}`}
                anchorEl={anchor}
                setAnchor={setAnchor}
                data={data}
                onClick={onSelectItem}
                {...menuProps}
            />
        </>
    );
}
