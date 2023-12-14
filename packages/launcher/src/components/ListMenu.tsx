import { useCachedReturn } from '@/utils/hooks/useCachedReturn';
import { Menu, MenuItem, Typography, alpha, type MenuProps } from '@mui/material';
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
        data.length > 0 && (
            <Menu
                anchorEl={anchorEl}
                {...menuProps}
                MenuListProps={{
                    sx: {
                        maxHeight: '50vh',
                        overflowY: 'auto',
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.88),
                    },
                }}
                open={open}
                onClose={handleCloseMenu}
            >
                {data.map((item, index) => (
                    <MemoMenuItem sx={{ maxWidth: '25vw' }} key={index} onClick={onClickRef.current.get(item)}>
                        <Typography variant="inherit" noWrap>
                            {renderRef.current.get(item)}
                        </Typography>
                    </MemoMenuItem>
                ))}
            </Menu>
        )
    );
}
