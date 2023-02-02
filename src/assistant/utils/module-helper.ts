export const SeerModuleHelper = {
    currentModule<T extends BasicMultPanelModule>() {
        return ModuleManager.currModule as T;
    },
    isConcreteModule<T extends BasicMultPanelModule>(name: string, module: BasicMultPanelModule): module is T {
        return module.name === name;
    },
};
