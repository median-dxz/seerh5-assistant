import { SEASConfigHandler } from '../shared/SEASConfigHandler.ts';

export class TaskOptions extends SEASConfigHandler<Map<string, object>> {
    async load() {
        return super.load(new Map());
    }

    async set(taskId: string, data: object) {
        return this.mutate((config) => {
            config.set(taskId, data);
        });
    }

    async remove(taskId: string) {
        return this.mutate((config) => {
            config.delete(taskId);
        });
    }
}
