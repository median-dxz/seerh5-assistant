import type { Task } from '@sea/mod-type';

export interface TaskInstance {
    id: string;
    name: string;
    task: Task;
    ownerMod: string;
}

export const store = new Map<string, TaskInstance>();

export function add(mod: string, task: Task) {
    const name = task.meta.name;
    const id = task.meta.id;

    const instance: TaskInstance = {
        task: task,
        id,
        name,
        ownerMod: mod
    };
    store.set(id, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
