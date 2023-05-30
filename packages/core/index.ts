export * from './common';
export * from './constant';

export * from './battle';
export * from './engine';
export * from './entity';
export * from './event-bus';

export * from './functions';
export * from './pet-helper';

export { CoreLoader } from './loader';

declare global {
    /** `sac`全局变量使用的额外命名空间 */
    export namespace sac {
        /** 原生客户端`console.log`的正则过滤列表 */
        var filterLogText: RegExp[];
        /** 原生客户端`console.warn`的正则过滤列表 */
        var filterWarnText: RegExp[];
        var SeerH5Ready: boolean;
        var SacReady: boolean;
    }
}


