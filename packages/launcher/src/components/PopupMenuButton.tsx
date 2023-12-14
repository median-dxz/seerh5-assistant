import type { ButtonProps, MenuProps } from '@mui/material';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { ListMenu } from './ListMenu';

const SUFFIX = 'item-menu';

interface PopupMenuButtonProps<T> {
    id?: string;
    children?: React.ReactNode;
    data?: T[] | (() => Promise<T[]>);
    dataKey?: string;
    renderItem?: (data: T, index: number) => React.ReactNode;
    onSelectItem?: (item: T, index: number) => void;
    buttonProps?: ButtonProps;
    menuProps?: Omit<MenuProps, 'open' | 'onClose' | 'onClick'>;
}

export function PopupMenuButton<T>({
    id,
    children,
    data: _data,
    renderItem,
    onSelectItem,
    buttonProps,
    menuProps,
}: PopupMenuButtonProps<T>) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [data, setData] = useState<T[] | undefined>(undefined);

    if (typeof _data !== 'function' && data !== _data) {
        setData(_data);
    }

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
        (e) => {
            setAnchor(e.currentTarget);
            buttonProps?.onClick?.(e);
            if (typeof _data === 'function') {
                _data().then(setData);
            }
        },
        [_data, buttonProps]
    );

    return (
        <>
            <Button {...buttonProps} onClick={handleClick}>
                {children}
            </Button>
            <ListMenu
                id={id && `${id}-${SUFFIX}`}
                anchorEl={anchor}
                setAnchor={setAnchor}
                data={data}
                renderItem={renderItem}
                onClick={onSelectItem}
                {...menuProps}
            />
        </>
    );
}
