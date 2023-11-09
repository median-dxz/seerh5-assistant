import type { Constructor } from '../common/utils.js';

export const UIModuleHelper = {
    currentModule<T extends BaseModule>() {
        return ModuleManager.currModule as T;
    },
    isConcreteModule<T extends BaseModule>(name: string, module: BaseModule): module is T {
        return module.name === name;
    },
};

/**
 * @description 获取EgretObject,以stage作为root寻找所有符合断言的obj,不会查找stage本身
 */
export function findObject<T extends Constructor<T>>(
    instanceClass: T,
    predicate?: (obj: egret.DisplayObject) => boolean
) {
    const root = LevelManager.stage;

    function find(parent: egret.DisplayObject) {
        if (parent.$children == null) {
            return [];
        }
        let result: InstanceType<T>[] = [];
        for (const child of parent.$children) {
            if (child instanceof instanceClass && (predicate == undefined || predicate(child) === true)) {
                result.push(child);
            }
            result = result.concat(find(child));
        }
        return result;
    }

    return find(root);
}

export function getImageButtonListener(button: eui.UIComponent) {
    return ImageButtonUtil.imgs[`k_${button.hashCode}`];
}
