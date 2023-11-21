import type { PluginOption } from 'vite';

export default function importMap() {
    return {
        name: 'importMap:collectIds',
        enforce: 'pre',
        async resolveId(source, importer, options) {
            console.log(`resolveId: ${source}`);
        },
    } as PluginOption;
}
