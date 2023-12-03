import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export interface MainState {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export const MainState = createContext({} as MainState);

export function useMainState() {
    return useContext(MainState);
}
