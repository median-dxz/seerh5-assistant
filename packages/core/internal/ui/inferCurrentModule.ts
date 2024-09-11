/** 断言当前Module的类型 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function inferCurrentModule<T extends BaseModule>(this: void) {
    return ModuleManager.currModule as T;
}
