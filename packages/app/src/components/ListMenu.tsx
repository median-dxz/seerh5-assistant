import { Menu, MenuItem, Typography, type MenuProps } from '@mui/material';
import { useCachedReturn } from '@sa-app/utils/hooks/useCachedReturn';
import React from 'react';

const MemoMenuItem = React.memo(MenuItem);

export type ListMenuProps<T> = {
    data?: T[];
    onClick?: (item: T, index: number) => void;
    renderItem?: (item: T, index: number) => React.ReactNode;
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
} & Omit<MenuProps, 'open' | 'onClose' | 'onClick'>;

export function ListMenu<T>(props: ListMenuProps<T>) {
    const { data = [], onClick, renderItem, anchorEl = null, setAnchor, ...menuProps } = props;
    const open = Boolean(anchorEl);

    const handleCloseMenu = React.useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);

    const handleClickItem = React.useCallback(
        (item: T, index: number) => () => {
            onClick?.(item, index);
            setAnchor(null);
        },
        [onClick, setAnchor]
    );

    const renderRef = useCachedReturn(data, renderItem, (_, r) => _ ?? JSON.stringify(r));
    const onClickRef = useCachedReturn(data, handleClickItem, (r) => r);

    return (
        <Menu anchorEl={anchorEl} {...menuProps} open={open} onClose={handleCloseMenu}>
            {data.map((item) => (
                <MemoMenuItem
                    sx={{ maxWidth: '25vw' }}
                    key={JSON.stringify(item)}
                    onClick={onClickRef.current.get(item)}
                >
                    <Typography variant="inherit" noWrap>
                        {renderRef.current.get(item)}
                    </Typography>
                </MemoMenuItem>
            ))}
        </Menu>
    );
}
