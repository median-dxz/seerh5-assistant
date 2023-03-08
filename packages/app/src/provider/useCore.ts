import { CoreLoader, SACore } from 'seerh5-assistant-core';

let core: undefined | SACore;

const loadCore = async () => {
    core = await CoreLoader.load();
};

const useCore = async () => {
    if (!core) {
        await loadCore();
    }
    return core!;
};

export { loadCore, useCore };

