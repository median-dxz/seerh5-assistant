import { SaModuleLogger, defaultStyle } from "../logger";

const log = SaModuleLogger('SAEngine-UI', defaultStyle.core);

export const SeerModuleHelper = {
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
export function findObject<T extends { new (...args: any[]): InstanceType<T> }>(
    instanceClass: T,
    predicate?: (obj: egret.DisplayObject) => boolean
) {
    const root = LevelManager.stage;

    function find(parent: egret.DisplayObject) {
        if (parent.$children == null) {
            return [];
        }
        let result: InstanceType<T>[] = [];
        for (let child of parent.$children) {
            if (child instanceof instanceClass && (predicate == undefined || predicate(child) === true)) {
                result.push(child);
            }
            result = result.concat(find(child));
        }
        return result;
    }

    return find(root);
}

export function getClickTarget() {
    const listener = (e: egret.TouchEvent) => {
        log(e.target);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, listener, null);
    };
    LevelManager.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, listener, null);
}

export function getImageButtonListener(button: eui.UIComponent) {
    return ImageButtonUtil.imgs[`k_${button.hashCode}`];
}
