export * from './common';
export * from './constant';
export * from './exports';
export { CoreLoader } from './loader';
export * from './logger';

declare global {
    /** `sac`全局变量使用的额外命名空间 */
    export namespace sac {
        /** 原生客户端`console.log`的正则过滤列表 */
        var filterLogText: RegExp[];
        /** 原生客户端`console.warn`的正则过滤列表 */
        var filterWarnText: RegExp[];
        var Mods: Map<string, import('./mod-manager').BaseMod>;
        var SeerH5Ready: boolean;
        var SacReady: boolean;
        var ResourceCache: Map<string, string>;
    }
}
