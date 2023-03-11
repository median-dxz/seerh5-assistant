import React from 'react';
import { SABattle } from 'seerh5-assistant-core';

export interface ISAContext {
    Battle: {
        enableAuto: boolean;
        updateAuto: React.Dispatch<React.SetStateAction<boolean>>;
        strategy: SABattle.Strategy;
        updateStrategy: (newStrategy: SABattle.Strategy) => void;
    };
}

export const SAContext = React.createContext({} as ISAContext);
