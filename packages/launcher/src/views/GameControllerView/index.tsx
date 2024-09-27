import { Grid2 } from '@mui/material';

import { AnimationMode } from './AnimationMode';
import { AutoCureState } from './AutoCureState';
import { BattleFire } from './BattleFire';
import { Inventory } from './Inventory';
import { PetBag } from './PetBag';

export function GameController() {
    return (
        <Grid2
            container
            spacing={4}
            sx={{
                pt: 3,
                pb: 3,
                flexDirection: 'row-reverse'
            }}
        >
            <Grid2
                container
                spacing={4}
                size={{ xs: 12, md: 4 }}
                sx={{
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    minWidth: '232px'
                }}
            >
                <Grid2 size={{ xs: 6, md: 12 }}>
                    <AnimationMode />
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    <AutoCureState />
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <BattleFire />
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                    <Inventory />
                </Grid2>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
                <PetBag />
            </Grid2>
        </Grid2>
    );
}
