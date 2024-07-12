import { useEffect, type PropsWithChildren } from 'react';

import * as ctService from '@/services/catchTimeBinding/CatchTimeBinding';

import { deploymentHandlers } from '@/services/modStore/deploymentHandlerSlice';
import { useModStore } from './useModStore';

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    const { sync } = useModStore();

    useEffect(() => {
        let active = true;

        void ctService.sync().then(async () => {
            if (!active) return;
            await Promise.all(
                deploymentHandlers.map(async (handler) => {
                    if (handler.state.enable && !handler.state.preload) {
                        await handler.fetch();
                        await handler.deploy();
                    }
                })
            );
            sync();
        });

        return () => {
            active = false;
        };
    }, [sync]);

    return children;
}
