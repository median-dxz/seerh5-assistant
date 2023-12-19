import * as ctService from '@/service/store/CatchTimeBinding';
import * as battleService from '@/service/store/battle';
import * as commandService from '@/service/store/command';
import * as levelService from '@/service/store/level';
import * as modService from '@/service/store/mod';
import * as signService from '@/service/store/sign';
import * as strategyService from '@/service/store/strategy';

import React, { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { ModStore } from './useModStore';

export function ModStoreProvider({ children }: PropsWithChildren<object>) {
    const [_, setSyncSignal] = useState({});
    const [reloadSignal, setReloadSignal] = useState<{ mods?: string[] }>({});

    const sync = useCallback(() => {
        setSyncSignal({});
    }, []);

    const reload = useCallback((mods?: string[]) => {
        setReloadSignal({
            mods,
        });
    }, []);

    useEffect(() => {
        // 加载模组
        let active = true;
        const service = modService;
        const signal = reloadSignal;

        ctService
            .sync()
            .then(() => {
                if (!active) return;
                if (signal.mods) {
                    return service.fetchMods(
                        signal.mods.map((mod) => {
                            return {
                                path: mod,
                            };
                        })
                    );
                } else {
                    return service.fetchMods();
                }
            })
            .then((mods) => {
                if (!active || !mods) return;
                mods.forEach(service.setup);
                setSyncSignal({});
            });

        return () => {
            active = false;
            service.teardown();
            setSyncSignal({});
        };
    }, [reloadSignal]);

    return (
        <ModStore.Provider
            value={{
                store: modService.store,
                sync,
                reload,
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
