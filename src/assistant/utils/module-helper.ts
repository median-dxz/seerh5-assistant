export const getCurrentModule = <T extends BaseModule>(): T => {
    return ModuleManager.currModule as T;
};
