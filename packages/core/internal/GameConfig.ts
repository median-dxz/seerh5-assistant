import { getLogger } from '../common/logger.js';
import { IS_DEV } from '../common/utils.js';
import type { GameConfigMap } from '../constant/TypeMaps.js';

type PredicateFn<T> = (value: T) => boolean;

export interface GameConfigRegistryEntity<T extends object> {
    objectName: (obj: T) => string;
    objectId: (obj: T) => number;
    objectMap: Map<number, T>;
}

export interface GameConfigQuery<T extends GameConfigMap[keyof GameConfigMap]> {
    get(this: void, id: number): T | undefined;
    find(this: void, predicate: PredicateFn<T>): T | undefined;
    filter(this: void, predicate: PredicateFn<T>): T[];
    getName(this: void, id: number): string | undefined;
    findByName(this: void, name: string): T | undefined;
    filterByName(this: void, name: string | RegExp): T[];
    getIdByName(this: void, name: string): number | undefined;
}

const gameConfigRegistryEntityMap = new Map<string, GameConfigQuery<GameConfigMap[keyof GameConfigMap]>>();

const logger = getLogger('GameConfigRegistry');

export const GameConfigRegistry = {
    getQuery<T extends keyof GameConfigMap>(this: void, type: T) {
        const entity = gameConfigRegistryEntityMap.get(type) as GameConfigQuery<GameConfigMap[T]> | undefined;

        if (entity == undefined) {
            throw new Error(`不支持的查询集合 ${type}`);
        }

        return entity;
    },

    register<T extends keyof GameConfigMap>(type: T, entity: GameConfigRegistryEntity<GameConfigMap[T]>) {
        if (gameConfigRegistryEntityMap.has(type)) {
            IS_DEV && console.warn(`register: 查询 ${type} 已经被注册, 这将导致之前的查询被覆盖, 请检查可能的冲突问题`);
            logger.warn(`register: ${type} 查询将被覆盖`);
        }

        const { objectMap, objectName, objectId } = entity;

        function find(predicate: PredicateFn<GameConfigMap[T]>) {
            return objectMap.values().find(predicate);
        }

        function filter(predicate: PredicateFn<GameConfigMap[T]>) {
            return Array.from(objectMap.values().filter(predicate));
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
            getIdByName
        } satisfies GameConfigQuery<GameConfigMap[T]>);
        logger.info(`register: ${type}`);
    },

    unregister(type: keyof GameConfigMap) {
        logger.info(`unregister: ${type}`);
        return gameConfigRegistryEntityMap.delete(type);
    }
};

export const query = GameConfigRegistry.getQuery;
