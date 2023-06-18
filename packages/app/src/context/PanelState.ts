import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
export interface PanelState {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    lock: boolean;
    setLock: Dispatch<SetStateAction<boolean>>;
}

export const PanelStateContext = React.createContext({} as PanelState);
