import React from 'react';
export interface PanelState {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    lock: boolean;
    setLock: (newValue: boolean) => void;
}

export const PanelStateContext = React.createContext({} as PanelState);
