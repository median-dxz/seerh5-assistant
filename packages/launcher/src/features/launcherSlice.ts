import { createAppSlice } from '@/shared/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

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

export const launcherSlice = createAppSlice({
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
        setIsFighting: (state, { payload }: PayloadAction<boolean>) => {
            state.isFighting = payload;
        }
    },
    selectors: {
        selectMainOpen: (state) => state.mainOpen,
        selectCommandOpen: (state) => state.commandOpen,
        selectIsFighting: (state) => state.isFighting
    }
});

export const { reducer: launcherReducer, actions: launcherActions, selectors: launcherSelectors } = launcherSlice;
