import { extraActions, initializer as initializerSlice } from './slice';

export const initializer = {
    reducer: initializerSlice.reducer,
    ...initializerSlice.actions,
    init: extraActions.init,
    ...initializerSlice.selectors
};
