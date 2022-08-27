import { MenuOpen } from '@mui/icons-material';
import { Fab } from '@mui/material';
import * as React from 'react';

interface MainMenuProps {
    menuClickHandler: React.MouseEventHandler<HTMLButtonElement> | undefined;
}
export function MainMenu(props: MainMenuProps) {
    return (
        <Fab color="primary" onClick={props.menuClickHandler}>
            <MenuOpen />
        </Fab>
    );
}
