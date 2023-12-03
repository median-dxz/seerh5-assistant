import React, { useEffect, type PropsWithChildren } from 'react';

import { useModStore } from '@/context/useModStore';
import * as ctService from '@/service/store/CatchTimeBinding';
import * as service from '@/service/store/mod';

export function ModLoader({ children }: PropsWithChildren<object>) {
    const { sync } = useModStore();

    useEffect(() => {
        // 加载模组
        let active = true;

        ctService
            .sync()
            .then(() => {
                if (!active) return;
                return service.fetchMods();
            })
            .then((mods) => {
                if (!active || !mods) return;
                mods.forEach(service.setup);
                sync();
            });

        return () => {
            active = false;
            service.teardown();
            sync();
        };
    }, [sync]);

    return <>{children}</>;
}
