import * as ctService from '@/service/store/CatchTimeBinding';
import * as battleService from '@/service/store/battle';
import * as commandService from '@/service/store/command';
import * as levelService from '@/service/store/level';
import * as modService from '@/service/store/mod';
import * as signService from '@/service/store/sign';
import * as strategyService from '@/service/store/strategy';

import React, { useCallback, useState, type PropsWithChildren } from 'react';
import { ModStore } from './useModStore';

export function ModStoreProvider({ children }: PropsWithChildren<object>) {
    const [_, setSignal] = useState({});

    const sync = useCallback(() => {
        setSignal({});
    }, []);

    return (
        <ModStore.Provider
            value={{
                store: modService.store,
                sync,
                ctStore: ctService.store,
                strategyStore: strategyService.store,
                battleStore: battleService.store,
                levelStore: levelService.store,
                commandStore: commandService.store,
                signStore: signService.store,
            }}
        >
            {children}
        </ModStore.Provider>
    );
}
