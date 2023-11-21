import type { GameConfigMap } from 'constant/type.js';

type PredicateFn<T> = (value: T) => boolean;

export interface GameConfigRegistryEntity<T extends object> {
    objectName: (obj: T) => string;
    objectId: (obj: T) => number;
    iterator: IterableIterator<T>;
}

export interface GameConfigQuery<T extends GameConfigMap[keyof GameConfigMap]> {
    get(id: number): T;
    find(predicate: PredicateFn<T>): T;
    filter(predicate: PredicateFn<T>): T[];
    getName(id: number): string;
    findByName(name: string): T;
    filterByName(name: string | RegExp): T[];
}

const gameConfigRegistryEntityMap = new Map<string, GameConfigQuery<GameConfigMap[keyof GameConfigMap]>>();

export const GameConfigRegistry = {
    getQuery<T extends keyof GameConfigMap>(type: T) {
        const entity = gameConfigRegistryEntityMap.get(type) as GameConfigQuery<GameConfigMap[T]> | undefined;

        if (entity == undefined) {
            throw `不支持的查询集合`;
        }

        return entity;
    },

    register<T extends keyof GameConfigMap>(type: T, entity: GameConfigRegistryEntity<GameConfigMap[T]>) {
        const { iterator, objectName, objectId } = entity;

        function find(predicate: PredicateFn<GameConfigMap[T]>) {
            for (const obj of iterator) {
                if (predicate(obj)) {
                    return obj;
                }
            }
            return undefined;
        }

        function filter(predicate: PredicateFn<GameConfigMap[T]>) {
            const r = [];
            for (const obj of iterator) {
                if (predicate(obj)) {
                    r.push(obj);
                }
            }
            return r;
        }

        function get(id: number) {
            return find((v) => objectId(v) === id);
        }

        function findByName(name: string) {
            return find((v) => objectName(v) === name);
        }

        function filterByName(name: string | RegExp) {
            return filter((v) => Boolean(objectName(v).match(name)));
        }

        function getName(id: number) {
            const o = find((v) => objectId(v) === id);
            return o && objectName(o);
        }

        return gameConfigRegistryEntityMap.set(type, {
            get,
            getName,
            filter,
            filterByName,
            find,
            findByName,
        } as GameConfigQuery<GameConfigMap[T]>);
    },
};
