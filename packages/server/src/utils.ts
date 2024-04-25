export const praseNamespace = (ns: string) => {
    const [scope, id] = ns.split('::');
    return {
        scope,
        id
    } as const;
};

export const getNamespace = (scope: string, id: string) => {
    return `${scope}::${id}`;
};
