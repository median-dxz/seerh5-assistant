import type { SEAConfigItemSchema, SEAModMetadata } from '@sea/mod-type';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PluginOption } from 'vite';

interface SEAModBuilderOptions {
    server: string;
}

export function SEAModInstall({ server }: SEAModBuilderOptions) {
    let filename: string;
    return [
        {
            name: 'mod:collect-output',
            async writeBundle(options, bundle) {
                let { dir } = options;
                if (!dir) dir = path.resolve(process.cwd(), 'dist');
                filename = bundle[Object.keys(bundle)[0]].fileName;
                filename = path.resolve(dir, filename);
            }
        },
        {
            name: 'mod:install',
            async buildEnd() {
                if (!filename) return;
                const modImport = (await import(pathToFileURL(filename).toString())) as { metadata: SEAModMetadata };
                const metadata = buildMetadata(modImport.metadata);
                const { scope, id } = metadata;
                const file = await fs.readFile(filename);

                console.log(metadata);
                const options = {
                    builtin: false,
                    preload: metadata.preload,
                    config: metadata.configSchema ? buildDefaultConfig(metadata.configSchema) : undefined,
                    data: metadata.data,
                    update: true
                };

                const data = new FormData();
                data.append('mod', new File([file], `${scope}.${id}.js`, { type: 'text/javascript' }));
                data.append('options', JSON.stringify(options));

                const query = new URLSearchParams({
                    id,
                    scope
                });

                if (server.endsWith('/')) server = server.slice(0, -1);

                return fetch(`${server}/api/mods/install?` + query.toString(), {
                    body: data,
                    method: 'POST'
                }).then((r) => r.json());
            }
        }
    ] as PluginOption[];
}

export function buildMetadata(metadata: SEAModMetadata) {
    let { scope, version, preload } = metadata;

    scope = scope ?? 'external';
    version = version ?? '0.0.0';
    preload = preload ?? false;

    return { ...metadata, scope, version, preload } as SEAModMetadata & {
        version: string;
        scope: string;
        preload: boolean;
    };
}

export function buildDefaultConfig(configSchema: Record<string, SEAConfigItemSchema>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key];
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}
