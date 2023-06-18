declare const sac: typeof import('sa-core');

declare abstract class BaseMod {
    reflect(method: string, ...args: unknown[]): unknown;

    getKeys(): string[];

    getParameterList(method: string): string[];

    abstract init(): void;
    destroy?(): void;
    
    abstract meta: { id: string; description: string };

    config: unknown;
    defaultConfig?: unknown;
}
