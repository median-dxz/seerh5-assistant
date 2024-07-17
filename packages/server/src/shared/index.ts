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
