import type { SEAConfigSchema, SEAModMetadata } from '@sea/mod-type';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import superjson from 'superjson';
import { type PluginOption } from 'vite';

interface SEAModBuilderOptions {
    server: string;
}

export function SEAModInstall({ server }: SEAModBuilderOptions) {
    return [
        {
            name: 'mod:install',
            async writeBundle(options, bundle) {
                let { dir } = options;
                if (!dir) dir = path.resolve(process.cwd(), 'dist');
                let filename = bundle[Object.keys(bundle)[0]].fileName;
                filename = path.resolve(dir, filename);
                const modImport = (await import(pathToFileURL(filename).toString())) as { metadata: SEAModMetadata };
                const metadata = buildMetadata(modImport.metadata);
                const { scope, id } = metadata;
                const file = await fs.readFile(filename);

                this.info('metadata:');
                console.log(metadata);

                const modInstallOptions = {
                    builtin: false,
                    preload: metadata.preload,
                    config: metadata.configSchema ? buildDefaultConfig(metadata.configSchema) : undefined,
                    data: metadata.data,
                    update: true,
                    version: metadata.version
                };

                if (server.endsWith('/')) server = server.slice(0, -1);
                if (!server.startsWith('http')) server = 'http://' + server;

                try {
                    await fetch(`${server}/api/mods`);
                } catch (e) {
                    this.error(`Failed to connect to server: ${e.message}`);
                }

                const query = new URLSearchParams({
                    cid: getCompositeId(metadata)
                });

                let modSerializedData: string | undefined = undefined;
                if (metadata.data !== undefined) {
                    modSerializedData = superjson.stringify(metadata.data);
                }

                const data = new FormData();
                data.append(
                    'options',
                    new Blob([JSON.stringify({ ...modInstallOptions, data: modSerializedData })], {
                        type: 'application/json'
                    })
                );
                data.append('mod', new File([file], `${scope}.${id}.js`, { type: 'text/javascript' }));

                const r = await fetch(`${server}/api/mods/install?` + query.toString(), {
                    body: data,
                    method: 'POST'
                }).then((r) => r.json());

                this.info(`install result:`);
                console.log(r);
            }
        }
    ] as PluginOption[];
}

type DefinedModMetadata = Required<Omit<SEAModMetadata, 'configSchema' | 'data'>> &
    Pick<SEAModMetadata, 'configSchema' | 'data'>;

function getCompositeId({ id, scope }: Pick<DefinedModMetadata, 'id' | 'scope'>) {
    scope = scope.replace(/:/g, '/:/');
    id = id.replace(/:/g, '/:/');
    return `${scope}::${id}`;
}

function buildMetadata(metadata: SEAModMetadata) {
    let { scope, version, preload, description } = metadata;

    scope = scope ?? 'external';
    version = version ?? '0.0.1';
    preload = preload ?? false;
    description = description ?? '';

    return { ...metadata, scope, version, preload, description } as DefinedModMetadata;
}

function buildDefaultConfig(configSchema: SEAConfigSchema) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key];
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}
