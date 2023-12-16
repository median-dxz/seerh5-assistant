import { PopupMenuButton, type PopupMenuButtonProps } from '@/components/PopupMenuButton';
import React from 'react';

export function SelectorButton<T>({ children, ...props }: PopupMenuButtonProps<T>) {
    return (
        <PopupMenuButton
            buttonProps={{
                sx: { whiteSpace: 'nowrap', minWidth: '40%', overflow: 'hidden' },
            }}
            {...props}
        >
            {children}
        </PopupMenuButton>
    );
}
