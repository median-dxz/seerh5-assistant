import React, { useEffect, type PropsWithChildren } from 'react';

import * as ctService from '@/service/store/CatchTimeBinding';

import { deploymentHandlers } from '@/service/mod/handler';
import { MainStateProvider } from './MainStateProvider';
import { TaskSchedulerProvider } from './TaskSchedulerProvider';
import { useModStore } from './useModStore';

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    const { sync } = useModStore();

    useEffect(() => {
        let active = true;

        ctService
            .sync()
            .then(() => {
                if (!active) return;
                return Promise.all(
                    deploymentHandlers.map(async (handler) => {
                        if (handler.state.enable && !handler.state.preload) {
                            await handler.fetch();
                            await handler.deploy();
                        }
                    })
                );
            })
            .then(sync);

        return () => {
            active = false;
        };
    }, [sync]);

    return (
        <TaskSchedulerProvider>
            <MainStateProvider>{children}</MainStateProvider>
        </TaskSchedulerProvider>
    );
}
