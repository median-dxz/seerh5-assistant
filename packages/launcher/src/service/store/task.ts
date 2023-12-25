export interface TaskInstance {
    id: string;
    name: string;
    task: SEAL.Task;
    ownerMod: string;
}

export const store = new Map<string, TaskInstance>();

export function add(mod: string, task: SEAL.Task) {
    const name = task.meta.name;
    const id = task.meta.id;

    const instance: TaskInstance = {
        task: task,
        id,
        name,
        ownerMod: mod,
    };
    store.set(id, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
