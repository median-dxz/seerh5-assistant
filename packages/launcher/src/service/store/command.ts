import type { Command } from '@sea/mod-type';

export interface CommandInstance extends Command {
    ownerMod: string;
}

export const store = new Map<string, CommandInstance>();

export function add(mod: string, _command: Command) {
    const instance: CommandInstance = {
        ..._command,
        ownerMod: mod
    };
    store.set(_command.name, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
