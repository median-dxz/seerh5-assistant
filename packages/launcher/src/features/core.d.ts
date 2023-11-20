declare global {
    interface Window {
        sea: {
            /** 正则过滤列表 */
            logRegexFilter: { log: RegExp[]; warn: RegExp[] };
        };
    }
}
