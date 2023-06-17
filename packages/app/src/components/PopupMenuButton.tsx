import type { ButtonProps, MenuProps } from '@mui/material';
import { Button } from '@mui/material';
import React from 'react';
import { ListMenu } from './ListMenu';

const SUFFIX = 'item-menu';

interface PopupMenuButtonProps<T> {
    id?: string;
    children?: React.ReactNode;
    data?: T[];
    renderItem?: (data: T, index: number) => React.ReactNode;
    onSelectItem?: (item: T, index: number) => void;
    buttonProps?: ButtonProps;
    menuProps?: Omit<MenuProps, 'open' | 'onClose' | 'onClick'>;
}

export function PopupMenuButton<T>({
    id,
    children,
    data,
    renderItem,
    onSelectItem,
    buttonProps,
    menuProps,
}: PopupMenuButtonProps<T>) {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
        (e) => {
            setAnchor(e.currentTarget);
            buttonProps?.onClick?.(e);
        },
        [buttonProps]
    );

    return (
        <>
            <Button {...buttonProps} onClick={handleClick}>
                {children}
            </Button>
            {data && (
                <ListMenu
                    id={id && `${id}-${SUFFIX}`}
                    anchorEl={anchor}
                    setAnchor={setAnchor}
                    data={data}
                    renderItem={renderItem}
                    onClick={onSelectItem}
                    {...menuProps}
                />
            )}
        </>
    );
}
