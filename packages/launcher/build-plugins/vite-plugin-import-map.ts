import type { HtmlTagDescriptor, PluginOption } from 'vite';

const useAsyncData = <T>() => {
    let resolver: (value: T) => void;
    const data = new Promise<T>((r) => {
        resolver = r;
    });
    return [resolver!, data] as const;
};

interface ImportMapOptions {
    options: Record<string, string | { path: string; extras: string[] }>;
}

/**
 * @important
 * Before using this plugin, index.html (the entry file) should be added to `rollupOptions.input`
 * as the entry of your application manually.
 * Also, you should grant that the emitted chunk filename contains the module name.
 * To diff reexported file from module file itself, the plugin will add `@chunk` suffix to the chunk's filename.
 * @see https://rollupjs.org/configuration-options/#preserveentrysignatures
 */
export default function importMap({ options }: ImportMapOptions) {
    const modules = Object.keys(options);
    const entryIds = new Map<string, ReturnType<typeof useAsyncData<string>>>();
    const bundleFiles = new Map<string, ReturnType<typeof useAsyncData<string>>>();
    let dev = true;

    modules.forEach((module) => {
        entryIds.set(module, useAsyncData<string>());
        bundleFiles.set(module, useAsyncData<string>());
    });

    return [
        {
            name: 'import-map:config',
            enforce: 'post',
            async config(config) {
                type InferArrayType<T extends unknown[] | unknown> = (T extends Array<infer U> ? U : never) | never;

                let output = config.build?.rollupOptions?.output ?? {};
                type RollupOutputOptions = InferArrayType<typeof output>;

                const buildOutput = (output: RollupOutputOptions) => {
                    const manualChunks = output.manualChunks ?? {};
                    modules.forEach((module) => {
                        manualChunks[module + '@chunk'] = [module];
                    });
                    return {
                        ...output,
                        manualChunks,
                        minifyInternalExports: false,
                        format: 'es'
                    } as RollupOutputOptions;
                };

                if (Array.isArray(output)) {
                    output = output.map(buildOutput);
                } else {
                    output = buildOutput(output);
                }

                const input = config.build?.rollupOptions?.input ?? {};

                modules.forEach((module) => {
                    const option = options[module];
                    if (typeof option === 'string') {
                        input[module] = option;
                    } else {
                        input[module] = option.path;
                    }
                });

                return {
                    build: {
                        rollupOptions: {
                            input,
                            output,
                            preserveEntrySignatures: 'strict'
                        }
                    }
                };
            }
        },
        {
            name: 'import-map:get-env',
            enforce: 'post',
            configResolved(config) {
                dev = config.command === 'serve';
            }
        },
        {
            name: 'import-map:collect-id',
            enforce: 'pre',
            apply: 'serve',
            async resolveId(id, importer) {
                const module = modules.find((module) => id.startsWith(module));
                if (module) {
                    const entryId = (await this.resolve(id, importer))?.id;
                    if (!entryId) {
                        throw `${module} not found`;
                    }
                    const [resolver] = entryIds.get(module)!;
                    resolver(entryId);
                    this.info(`${module} entry id: ${entryId}`);
                }
            }
        },
        {
            name: 'import-map:collect-id',
            apply: 'build',
            async generateBundle(_, bundle) {
                const results = new Map<string, string>();

                Object.entries(bundle).forEach(([name, chunk]) => {
                    const module = modules.find((module) => name.includes(module));
                    if (!module) return;

                    this.info(`${module} chunk: ${chunk.fileName}`);
                    // because there maybe exists a "facade" entry chunk created by rollup
                    if (!results.has(module) || results.get(module)?.includes('@chunk')) {
                        results.set(module, chunk.fileName);
                    }
                });

                for (const [module, chunk] of results) {
                    const [resolver] = bundleFiles.get(module)!;
                    resolver(chunk);
                }
            }
        },
        {
            name: 'import-map:injected-html',
            transformIndexHtml: {
                order: 'post',
                async handler(html) {
                    const tags: HtmlTagDescriptor[] = [];
                    const imports: Record<string, string> = {};
                    const scriptTag: HtmlTagDescriptor = {
                        tag: 'script',
                        attrs: {
                            type: 'importmap'
                        },
                        injectTo: 'head-prepend'
                    };

                    const buildTag = async (module: string) => {
                        const [_0, entryId] = entryIds.get(module)!;
                        const [_1, bundleFile] = bundleFiles.get(module)!;

                        let resolvedURL: string;

                        if (dev) {
                            resolvedURL = await entryId;
                            if (!resolvedURL.startsWith('/')) {
                                resolvedURL = `/@fs/${resolvedURL}`;
                            }
                        } else {
                            resolvedURL = await bundleFile;
                            resolvedURL = `/${resolvedURL}`;
                            tags.push({
                                tag: 'link',
                                attrs: {
                                    rel: 'modulepreload',
                                    href: resolvedURL
                                }
                            });
                        }

                        imports[module] = resolvedURL;
                        const option = options[module];
                        if (typeof option === 'object') {
                            option.extras.forEach((extra) => {
                                imports[extra] = resolvedURL;
                            });
                        }
                    };
                    await Promise.all(modules.map(buildTag));

                    scriptTag.children = JSON.stringify({
                        imports
                    });

                    tags.push(scriptTag);

                    return {
                        html,
                        tags
                    };
                }
            }
        }
    ] as PluginOption[];
}
