import { Grid } from '@mui/material';

import { AnimationMode } from './AnimationMode';
import { AutoCureState } from './AutoCureState';
import { BattleFire } from './BattleFire';
import { Inventory } from './Inventory';
import { PetBag } from './PetBag';

export function GameController() {
    return (
        <Grid
            container
            spacing={4}
            sx={{
                pt: 3,
                pb: 3,
                flexDirection: 'row-reverse'
            }}
        >
            <Grid
                item
                container
                spacing={4}
                xs={12}
                md={4}
                sx={{
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    minWidth: '232px'
                }}
            >
                <Grid item xs={6} md={12}>
                    <AnimationMode />
                </Grid>

                <Grid item xs={6} md={12}>
                    <AutoCureState />
                </Grid>

                <Grid item xs={12}>
                    <BattleFire />
                </Grid>

                <Grid item xs={12}>
                    <Inventory />
                </Grid>
            </Grid>
            <Grid item xs={12} md={8}>
                <PetBag />
            </Grid>
        </Grid>
    );
}
