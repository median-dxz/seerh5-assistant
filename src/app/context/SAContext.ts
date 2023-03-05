import { AutoBattle } from '@sa-core/battle';
import React from 'react';

export interface ISAContext {
    Battle: {
        enableAuto: boolean;
        updateAuto: React.Dispatch<React.SetStateAction<boolean>>;
        strategy: AutoBattle.Strategy;
        updateStrategy: (newStrategy: AutoBattle.Strategy) => void;
    };
}

export const SAContext = React.createContext({} as ISAContext);