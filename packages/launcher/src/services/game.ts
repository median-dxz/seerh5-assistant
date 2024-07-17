import { createApi } from '@reduxjs/toolkit/query/react';
import type { Pet } from '@sea/core';
import { debounce, engine, SEAEventSource, SEAPetStore, Subscription } from '@sea/core';
import { baseQuery } from './endpointsBase';

export type BattleFireInfo = Awaited<ReturnType<typeof engine.battleFireInfo>>;

export const gameApi = createApi({
    baseQuery,
    reducerPath: 'api/game',
    tagTypes: ['BattleFire', 'BagPets'],
    endpoints: (build) => ({
        battleFire: build.query<BattleFireInfo, void>({
            query: () => engine.battleFireInfo,
            providesTags: ['BattleFire'],
            async onCacheEntryAdded(
                _,
                { getCacheEntry, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
            ) {
                let timer: number | undefined;
                const sub = new Subscription();
                const clear = () => {
                    timer && clearInterval(timer);
                    sub.dispose();
                };

                try {
                    await cacheDataLoaded;

                    sub.on(SEAEventSource.egret('battleFireUpdateInfo'), () => {
                        void dispatch(gameApi.util.invalidateTags(['BattleFire']));
                    });

                    const { data } = getCacheEntry();
                    if (data?.valid) {
                        let { timeLeft } = data;

                        timer = window.setInterval(() => {
                            updateCachedData((draft) => {
                                if (timeLeft > 0) {
                                    draft.timeLeft = --timeLeft;
                                } else {
                                    draft.valid = false;
                                }
                            });
                            if (timeLeft === 0) {
                                dispatch(gameApi.util.invalidateTags(['BattleFire']));
                                clear();
                            }
                        }, 1000);
                    }
                } catch (e) {
                    // noop
                }

                await cacheEntryRemoved.then(clear);
            }
        }),
        autoCure: build.query<boolean, void>({
            query: () => engine.autoCureState,
            async onCacheEntryAdded(_, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const sub = new Subscription();
                try {
                    await cacheDataLoaded;
                    sub.on(SEAEventSource.socket(42019, 'send'), (data) => {
                        if (Array.isArray(data) && data.length === 2 && data[0] === 22439) {
                            const [_, autoCure] = data as [number, number];
                            updateCachedData(() => autoCure === 1);
                        }
                    });
                } catch (e) {
                    // noop
                }
                await cacheEntryRemoved;
                sub.dispose();
            }
        }),
        bagPets: build.query<[Pet[], Pet[]], void>({
            query: () => SEAPetStore.bag.get.bind(SEAPetStore.bag),
            providesTags: ['BagPets'],
            async onCacheEntryAdded(_, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
                const sub = new Subscription();
                try {
                    await cacheDataLoaded;

                    sub.on(
                        SEAEventSource.hook('pet_bag:deactivate'),
                        debounce(() => dispatch(gameApi.util.invalidateTags(['BagPets'])), 500)
                    );

                    sub.on(SEAEventSource.hook('pet_bag:update'), (pets) => {
                        updateCachedData(() => pets);
                    });
                } catch (e) {
                    // noop
                }
                await cacheEntryRemoved;
                sub.dispose();
            }
        })
    })
});

// https://github.com/reduxjs/redux-toolkit/issues/4498
// https://github.com/reduxjs/redux-toolkit/issues/4066
// https://github.com/reduxjs/redux-toolkit/pull/4467
// export const { endpoints } = gameApi;
