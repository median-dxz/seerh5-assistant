import React from 'react';

export interface ISAContext {
    Battle: {
        enableAuto: boolean;
        updateAuto: React.Dispatch<React.SetStateAction<boolean>>;
    };
}

export const SAContext = React.createContext({} as ISAContext);
