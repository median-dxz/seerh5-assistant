import { Mods, register } from '@sa-app/mod-manager';

export const registerAllMod = async () => {
    const mods = await Promise.all([
        import('../mods/official/LocalPetSkin'),
        import('../mods/official/CraftSkillStone'),
        import('../mods/official/applybm'),
        import('../mods/official/sign'),
        import('../mods/module/petbag'),
        import('../mods/module/team'),
    ]);

    for (const mod of mods) {
        const modObj = mod.default;
        register(modObj);
    }
    for (const [_, mod] of Mods) {
        mod.init();
    }
};
