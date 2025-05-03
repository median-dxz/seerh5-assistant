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
                flexDirection: 'row-reverse'
            }}
        >
            <Grid
                container
                spacing={4}
                size={{ xs: 12, md: 4 }}
                sx={{
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    minWidth: '256px'
                }}
            >
                <Grid size={{ xs: 6, md: 12 }}>
                    <AnimationMode />
                </Grid>

                <Grid size={{ xs: 6, md: 12 }}>
                    <AutoCureState />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <BattleFire />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Inventory />
                </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 'grow' }}>
                <PetBag />
            </Grid>
        </Grid>
    );
}
