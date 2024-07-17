import { SEASConfigData } from '../shared/SEASConfigData.ts';

class TaskConfig extends SEASConfigData<Map<string, object>> {
    async loadWithDefault(configFile: string) {
        return super.loadWithDefault(configFile, new Map());
    }

    async setOptions(taskId: string, data: object) {
        return this.mutate((config) => {
            config.set(taskId, data);
        });
    }

    options(taskId: string) {
        return this.query().get(taskId);
    }

    async removeOptions(taskId: string) {
        return this.mutate((config) => {
            config.delete(taskId);
        });
    }
}

export const taskConfig = new TaskConfig();
