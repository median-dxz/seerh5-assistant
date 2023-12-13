import React from 'react';

import { Grid } from '@mui/material';

import { AnimationMode } from './AnimationMode';
import { BattleFire } from './BattleFire';
import { Inventory } from './Inventory';
import { PetBag } from './PetBag';

export function GameController() {
    return (
        <Grid container>
            <Grid item sm={12} md={3}>
                <AnimationMode />
                <BattleFire />
                <Inventory />
            </Grid>
            <Grid item sm={12} md={9}>
                <PetBag />
            </Grid>
        </Grid>
    );
}
