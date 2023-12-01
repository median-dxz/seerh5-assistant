import type { PluginOption } from 'vite';
import { ViteDevServer } from 'vite';

export default function importMap() {
    let server: ViteDevServer;
    let fi: boolean = false;
    return {
        name: 'importMap:collectIds',
        enforce: 'pre',
        configureServer(_server) {
            server = _server;
        },

        async resolveId(source, importer, options) {
            if (source === 'sea-core' && !fi) {
                fi = true;
                const resolved = await this.resolve(source, importer);
                console.log(resolved);
            }
        },
    } as PluginOption;
}
