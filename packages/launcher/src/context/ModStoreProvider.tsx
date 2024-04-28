import * as ctService from '@/service/store/CatchTimeBinding';
import * as battleService from '@/service/store/battle';
import * as commandService from '@/service/store/command';
import * as modService from '@/service/store/mod';
import * as strategyService from '@/service/store/strategy';
import * as taskService from '@/service/store/task';

import { deploymentHandlers, fetchList } from '@/service/mod/handler';
import { installBuiltinMods } from '@/service/mod/install';
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
                    deploymentHandlers
                        .filter((handler) => {
                            return handler.state.enable && handler.state.preload;
                        })
                        .map(async (handler) => {
                            await handler.fetch();
                            return handler.deploy();
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
