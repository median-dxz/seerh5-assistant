import { MultiUserConfigHandler } from '../shared/MultiUserConfigHandler.ts';

export class TaskOptions extends MultiUserConfigHandler<Map<string, object>> {
    async load() {
        return super.loadWithDefaultConfig(new Map());
    }

    async set(uid: string, taskId: string, options: object) {
        return this.mutate(uid, (config) => {
            config.set(taskId, options);
        });
    }

    async remove(uid: string, taskId: string) {
        return this.mutate(uid, (config) => {
            config.delete(taskId);
        });
    }
}
