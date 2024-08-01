import { createAppSlice } from '@/shared';

export interface LauncherState {
    mainOpen: boolean;
    commandOpen: boolean;
    isFighting: boolean;
}

const initialState: LauncherState = {
    mainOpen: false,
    commandOpen: false,
    isFighting: false
};

export const launcher = createAppSlice({
    name: 'launcher',
    initialState,
    reducers: {
        toggleMain: (state) => {
            state.mainOpen = !state.mainOpen;
        },
        closeMain: (state) => {
            state.mainOpen = false;
        },
        toggleCommand: (state) => {
            state.commandOpen = !state.commandOpen;
        },
        fightStart: (state) => {
            state.isFighting = true;
        },
        fightEnd: (state) => {
            state.isFighting = false;
        }
    }
});
