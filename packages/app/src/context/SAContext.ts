import React from 'react';
import { AutoBattle } from 'seerh5-assistant-core';

export interface ISAContext {
    Battle: {
        enableAuto: boolean;
        updateAuto: React.Dispatch<React.SetStateAction<boolean>>;
        strategy: AutoBattle.Strategy;
        updateStrategy: (newStrategy: AutoBattle.Strategy) => void;
    };
}

export const SAContext = React.createContext({} as ISAContext);
