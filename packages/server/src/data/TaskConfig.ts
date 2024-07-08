import type { DataObject } from '../shared/schemas.ts';
import { SEASConfigData } from '../shared/SEASConfigData.ts';

export interface TaskConfigData {
    currentOptions?: string;
    options: Map<string, DataObject>;
}

class TaskConfig extends SEASConfigData<Map<string, TaskConfigData>> {
    async loadWithDefault(configFile: string) {
        return super.loadWithDefault(configFile, new Map());
    }

    async addOptions(taskId: string, name: string, data: DataObject) {
        return this.mutate((config) => {
            if (!config.has(taskId)) {
                config.set(taskId, {
                    options: new Map()
                });
            }
            config.get(taskId)!.options.set(name, data);
        });
    }

    options(taskId: string, name: string) {
        return this.query().get(taskId)?.options.get(name);
    }

    allOptions(taskId: string) {
        return this.query().get(taskId)?.options;
    }

    currentOptions(taskId: string) {
        return this.query().get(taskId)?.currentOptions;
    }

    async setCurrentOptions(taskId: string, name: string) {
        return this.mutate((config) => {
            if (config.has(taskId)) {
                config.get(taskId)!.currentOptions = name;
            }
        });
    }

    async removeOptions(taskId: string, name: string) {
        return this.mutate((config) => {
            if (config.has(taskId)) {
                config.get(taskId)?.options.delete(name);
            }
        });
    }

    async remove(taskId: string) {
        return this.mutate((config) => {
            config.delete(taskId);
        });
    }
}

export const taskConfig = new TaskConfig();
