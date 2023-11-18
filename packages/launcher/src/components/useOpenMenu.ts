import React from 'react';

export function useOpenMenu() {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

    const openMenu = (anchorEl: HTMLElement | null) => {
        setAnchor(anchorEl);
    };

    const menuProps = {
        anchorEl: anchor,
        setAnchor,
    };

    return [menuProps, openMenu] as const;
}
