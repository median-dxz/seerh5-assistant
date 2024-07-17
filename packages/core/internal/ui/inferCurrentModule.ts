/** 断言当前Module的类型 */
export function inferCurrentModule<T extends BaseModule>(this: void) {
    return ModuleManager.currModule as T;
}
