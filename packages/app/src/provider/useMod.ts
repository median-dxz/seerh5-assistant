import { register as ModRegister } from 'seerh5-assistant-core';

export const useMod = async () => {
    let mods = await Promise.all([
        import('../mods/official/CraftSkillStone'),
        import('../mods/official/applybm'),
        import('../mods/official/sign'),
        import('../mods/module/petbag'),
        import('../mods/module/team'),
    ]);

    for (let mod of mods) {
        const modObj = mod.default;
        ModRegister(modObj.id, modObj.mod);
    }
};
