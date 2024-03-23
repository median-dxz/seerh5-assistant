import React, { useEffect, type PropsWithChildren } from 'react';

import * as ctService from '@/service/store/CatchTimeBinding';
import * as modService from '@/service/store/mod';

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
                return modService.fetchMods();
            })
            .then((mods) => {
                if (!active || !mods) return;
                mods.forEach(modService.setup);
                sync();
            });

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
