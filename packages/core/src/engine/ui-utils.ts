export const SeerModuleHelper = {
    currentModule<T extends BaseModule>() {
        return ModuleManager.currModule as T;
    },
    isConcreteModule<T extends BaseModule>(name: string, module: BaseModule): module is T {
        return module.name === name;
    },
};
