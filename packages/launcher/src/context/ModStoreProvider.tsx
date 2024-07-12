import * as ctService from '@/services/catchTimeBinding/CatchTimeBinding';
import * as battleService from '@/services/modStore/battle';
import * as commandService from '@/services/modStore/command';
import * as modService from '@/services/modStore/mod';
import * as strategyService from '@/services/modStore/strategy';
import * as taskService from '@/services/modStore/task';

import { deploymentHandlers, fetchList } from '@/services/modStore/deploymentHandlerSlice';
import { installBuiltinMods } from '@/services/modStore/install';
import { seac } from '@sea/core';
import React, { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { ModStore } from './useModStore';

export function ModStoreProvider({ children }: PropsWithChildren) {
    const [_, setSyncSignal] = useState({});

    const sync = useCallback(() => {
        setSyncSignal({});
    }, []);

    // 初始化时由该组件处理 builtin mods 的安装, 并部署 preload 类型的 mod
    useEffect(() => {
        let active = true;
        seac.addSetupFn('beforeGameCoreInit', async () => {
            if (active) {
                await installBuiltinMods();
                await fetchList();
                await Promise.all(
                    deploymentHandlers.map(async (handler) => {
                        if (handler.state.enable && handler.state.preload) {
                            await handler.fetch();
                            await handler.deploy();
                        }
                    })
                );
                sync();
            }
        });
        return () => {
            active = false;
        };
    }, [sync]);

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
