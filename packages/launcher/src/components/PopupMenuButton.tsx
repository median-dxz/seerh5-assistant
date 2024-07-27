import type { ButtonProps, MenuProps } from '@mui/material';
import { Button, CircularProgress, Typography } from '@mui/material';
import type { MouseEventHandler } from 'react';
import { useCallback, useEffect, useState } from 'react';
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

const Spinner = (
    <Typography sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <CircularProgress size="1.5rem" />
    </Typography>
);

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
    const [fetching, setFetching] = useState(false);

    const loadData = useCallback(async () => {
        if (typeof _data === 'function') {
            setFetching(true);
            const data = await _data();
            setFetching(false);
            setData(data.length ? data : undefined);
        } else if (Array.isArray(_data) && _data.length > 0) {
            setData(_data);
        } else {
            setData(undefined);
        }
    }, [_data]);

    useEffect(() => {
        if (!fetching && anchor !== null) {
            void loadData();
        }
    }, [anchor, fetching, loadData]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        buttonProps?.onClick?.(e);
        const target = e.currentTarget;
        if (!data?.length) {
            await loadData();
        }
        setAnchor(data?.length ? target : null);
    };

    return (
        <>
            <Button {...buttonProps} onClick={handleClick} disabled={fetching} endIcon={fetching ? Spinner : null}>
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
