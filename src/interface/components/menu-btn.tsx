import * as React from 'react';
import { MenuOpen } from '@mui/icons-material';
import { Fab } from '@mui/material';

export function MainMenu(props) {
    return (
        <Fab color="primary" onClick={props.menuClickHandler}>
            <MenuOpen />
        </Fab>
    );
}
