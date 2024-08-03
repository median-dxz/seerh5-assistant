export const praseCompositeId = (cid: string) => {
    const [scope, id] = cid.split('::');
    return {
        scope: scope.replaceAll('/:/', ':'),
        id: id.replaceAll('/:/', ':')
    };
};

export const getCompositeId = (scope: string, id: string) => {
    scope = scope.replaceAll(':', '/:/');
    id = id.replaceAll(':', '/:/');
    return `${scope}::${id}`;
};

export interface IStorage {
    source: string;
    load(defaultData?: object): Promise<object>;
    save(data: object): Promise<void>;
    delete(): Promise<void>;
}

export interface IModFileHandler {
    root: string;
    buildPath(filename: string): string;
    remove(cid: string): void | Promise<void>;
}
