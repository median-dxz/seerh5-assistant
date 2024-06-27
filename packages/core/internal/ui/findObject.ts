import type { Constructor } from '../../common/utils.js';

/**
 * 获取EgretObject, 以stage作为root寻找所有符合断言的obj, 不会查找stage本身
 *
 * @param classType obj的类对象
 * @param predicate 断言函数
 */
export function findObject<T>(classType: Constructor<T>, predicate?: (obj: egret.DisplayObject) => boolean) {
    const root = LevelManager.stage;

    function find(parent: egret.DisplayObject) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (parent.$children == null) {
            return [];
        }
        let result: T[] = [];
        for (const child of parent.$children) {
            if (child instanceof classType && (predicate == undefined || predicate(child))) {
                result.push(child);
            }
            result = result.concat(find(child));
        }
        return result;
    }

    return find(root);
}
