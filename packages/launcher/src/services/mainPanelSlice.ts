import { createSlice } from '@reduxjs/toolkit/react';

export interface MainPanelState {
    open: boolean;
}

const initialState: MainPanelState = {
    open: false
};

export const mainPanelSlice = createSlice({
    name: 'mainPanel',
    initialState,
    reducers: {
        toggle: (state) => {
            state.open = !state.open;
        },
        close: (state) => {
            state.open = false;
        },
        open: (state) => {
            state.open = true;
        }
    }
});

export const { reducer: mainPanelReducer, actions: mainPanelActions } = mainPanelSlice;
