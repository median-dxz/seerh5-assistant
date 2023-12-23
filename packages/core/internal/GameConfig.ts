import type { GameConfigMap } from '../constant/TypeMaps.js';

type PredicateFn<T> = (value: T) => boolean;

export interface GameConfigRegistryEntity<T extends object> {
    objectName: (obj: T) => string;
    objectId: (obj: T) => number;
    objectMap: Map<number, T>;
}

export interface GameConfigQuery<T extends GameConfigMap[keyof GameConfigMap]> {
    get(id: number): T | undefined;
    find(predicate: PredicateFn<T>): T | undefined;
    filter(predicate: PredicateFn<T>): T[];
    getName(id: number): string | undefined;
    findByName(name: string): T | undefined;
    filterByName(name: string | RegExp): T[];
    getIdByName(name: string): number | undefined;
}

const gameConfigRegistryEntityMap = new Map<string, GameConfigQuery<GameConfigMap[keyof GameConfigMap]>>();

export const GameConfigRegistry = {
    getQuery<T extends keyof GameConfigMap>(type: T) {
        const entity = gameConfigRegistryEntityMap.get(type) as GameConfigQuery<GameConfigMap[T]> | undefined;

        if (entity == undefined) {
            throw `不支持的查询集合 ${type}`;
        }

        return entity;
    },

    register<T extends keyof GameConfigMap>(type: T, entity: GameConfigRegistryEntity<GameConfigMap[T]>) {
        if (gameConfigRegistryEntityMap.has(type)) {
            throw `[error]: 重复注册配置查询 ${type}`;
        }

        const { objectMap, objectName, objectId } = entity;

        function find(predicate: PredicateFn<GameConfigMap[T]>) {
            for (const [_, obj] of objectMap) {
                if (predicate(obj)) {
                    return obj;
                }
            }
            return undefined;
        }

        function filter(predicate: PredicateFn<GameConfigMap[T]>) {
            const r: Array<GameConfigMap[T]> = [];
            for (const [_, obj] of objectMap) {
                if (predicate(obj)) {
                    r.push(obj);
                }
            }
            return r;
        }

        function get(id: number) {
            return objectMap.get(id);
        }

        function getName(id: number) {
            const o = objectMap.get(id);
            return o && objectName(o);
        }

        function findByName(name: string) {
            return find((v) => objectName(v) === name);
        }

        function filterByName(name: string | RegExp) {
            return filter((v) => Boolean(objectName(v)?.match(name)));
        }

        function getIdByName(name: string) {
            const o = findByName(name);
            return o && objectId(o);
        }

        gameConfigRegistryEntityMap.set(type, {
            get,
            getName,
            filter,
            filterByName,
            find,
            findByName,
            getIdByName,
        } satisfies GameConfigQuery<GameConfigMap[T]>);
    },

    unregister<T extends keyof GameConfigMap>(type: T) {
        return gameConfigRegistryEntityMap.delete(type);
    },
};

// eslint-disable-next-line @typescript-eslint/unbound-method
export const query = GameConfigRegistry.getQuery;