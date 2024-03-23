import * as ctService from '@/service/store/CatchTimeBinding';
import * as battleService from '@/service/store/battle';
import * as commandService from '@/service/store/command';
import * as modService from '@/service/store/mod';
import * as strategyService from '@/service/store/strategy';
import * as taskService from '@/service/store/task';

import React, { useCallback, useEffect, useState, type PropsWithChildren } from 'react';

import { ModStore } from './useModStore';

export function ModStoreProvider({ children }: PropsWithChildren) {
    const [_, setSyncSignal] = useState({});

    const sync = useCallback(() => {
        setSyncSignal({});
    }, []);

    // 初始化时由该组件主动 fetch 一次 mods
    useEffect(() => {
        let active = true;
        modService.fetchMods().then((modExports) => {
            if (active) {
                // mod service 会判断当前阶段只能加载 preload 类型的 mod
                modExports.forEach(modService.setup);
            }
        });
        return () => {
            active = false;
        };
    }, []);

    return (
        <ModStore.Provider
            value={{
                sync,
                ctStore: ctService.store,
                modStore: modService.store,
                strategyStore: strategyService.store,
                battleStore: battleService.store,
                taskStore: taskService.store,
                commandStore: commandService.store
            }}
        >
            {children}
        </ModStore.Provider>
    );
}
