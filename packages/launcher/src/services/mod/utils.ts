import * as endpoints from '@/services/endpoints';
import { buildDefaultConfig } from '@/shared/index';
import { reactive } from '@vue/reactivity';
import type { DefinedModMetadata } from './metadata';

export async function getModData({ scope, id, data: defaultData }: DefinedModMetadata) {
    if (defaultData) {
        let data = await endpoints.mod.data(scope, id);

        if (!data) {
            await endpoints.mod.setData(scope, id, defaultData);
            data = defaultData;
        }

        const proxyData = reactive(data);
        return { data: proxyData };
    }
    return {};
}

export async function getModConfig({ scope, id, configSchema }: DefinedModMetadata) {
    if (configSchema) {
        let config;
        config = await endpoints.mod.config(scope, id);
        if (!config) {
            config = buildDefaultConfig(configSchema);
            await endpoints.mod.setConfig(scope, id, config);
        }
        return { config };
    }
    return {};
}
