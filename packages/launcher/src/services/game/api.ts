import { createApi } from '@reduxjs/toolkit/query/react';

import type { Pet, WithClass } from '@sea/core';
import { debounce, engine, SEAEventSource, SEAPetStore, Subscription } from '@sea/core';

import { baseQuery } from '../shared';

import type { BattleFireInfo } from './utils';
import { monitorGameData, tagTypes } from './utils';

export const gameApi = createApi({
    baseQuery,
    reducerPath: 'api/game',
    tagTypes,
    endpoints: (build) => ({
        battleFire: build.query<BattleFireInfo, void>({
            query: () => engine.battleFireInfo,
            providesTags: ['BattleFire'],
            keepUnusedDataFor: 5,
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

                    timer = setInterval(() => {
                        const { data } = getCacheEntry();
                        if (!data) return;
                        const { timeLeft, valid } = data;
                        if (valid && timeLeft === 0) {
                            updateCachedData((draft) => {
                                draft.valid = false;
                            });
                            dispatch(gameApi.util.invalidateTags(['BattleFire']));
                        } else if (valid) {
                            updateCachedData((draft) => {
                                draft.timeLeft--;
                            });
                        }
                    }, 1000);
                } catch (e) {
                    // noop
                }

                await cacheEntryRemoved.then(clear);
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
        }),
        autoCure: build.query<boolean, void>({
            keepUnusedDataFor: 5 * 60,
            query: () => engine.autoCureState,
            onCacheEntryAdded: monitorGameData((_, sub, invalidateTags, updateCachedData) => {
                sub.on(SEAEventSource.socket(42036, 'send'), (data) => {
                    if (data.length !== 7) return;

                    data.readUnsignedInt();
                    const v = data.readShort();
                    if (v !== 22439) return;

                    const enable = data.readBoolean();

                    // 同步UI
                    const { __class__ } = engine.inferCurrentModule<WithClass<BaseModule>>();
                    if ('vipRecovery.VipRecovery' === __class__) {
                        const popView = engine.findObject(vipRecovery.vipRecoveryPopView).at(0);
                        popView && (popView.imgeCheckGou.visible = enable);
                    }

                    updateCachedData(enable);
                });
            })
        })
    })
});
