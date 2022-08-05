import { MenuOpen } from '@mui/icons-material';
import { Fab } from '@mui/material';
import React from 'react';

export function MainMenu(props) {
    return (
        <Fab color="primary" onClick={props.menuClickHandler}>
            <MenuOpen />
        </Fab>
    );
}
