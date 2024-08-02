import type { QueryDefinition } from '@reduxjs/toolkit/query/react';

import type { engine } from '@sea/core';
import { Subscription } from '@sea/core';

import type { baseQuery } from '../shared';
import { gameApi } from './api';

export type BattleFireInfo = Awaited<ReturnType<typeof engine.battleFireInfo>>;
export const tagTypes = ['BattleFire', 'BagPets'] as const;
type GameApiTagTypes = (typeof tagTypes)[number];

export const monitorGameData =
    <ResultType, QueryArg>(
        subscribe: (
            arg: QueryArg,
            subscription: Subscription,
            invalidateTags: (tags: GameApiTagTypes[]) => void,
            updateCachedData: (data: ResultType) => void
        ) => void
    ): QueryDefinition<QueryArg, typeof baseQuery, GameApiTagTypes, ResultType, 'api/game'>['onCacheEntryAdded'] =>
    async (arg, { dispatch, updateCachedData, cacheDataLoaded, cacheEntryRemoved }) => {
        const subscription = new Subscription();
        try {
            await cacheDataLoaded;
            subscribe(
                arg,
                subscription,
                (tags) => dispatch(gameApi.util.invalidateTags(tags)),
                (data) => updateCachedData(() => data)
            );
        } catch (e) {
            // noop
        }
        await cacheEntryRemoved;
        subscription.dispose();
    };
