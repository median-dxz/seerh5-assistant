import React from 'react';

export const PanelStateContext = React.createContext(
    {} as {
        open: boolean;
        setOpen: (newValue: boolean) => void;
        lock: boolean;
        setLock: (newValue: boolean) => void;
    }
);
