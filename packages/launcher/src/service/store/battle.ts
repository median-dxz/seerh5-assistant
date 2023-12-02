export const loadBattle = async (id: string) => {
    const BattleConfig = ModStore.get(`${SEAModType.BATTLE_MOD}::${scope}::${id}`);
    if (!BattleConfig) {
        throw new Error('未找到BATTLE');
    }
    if (BattleConfig.meta.type !== SEAModType.BATTLE_MOD) {
        throw new Error('该Mod不是BATTLE类型');
    }
    const battleExport = (BattleConfig as BattleMod).export;
    return {
        beforeBattle: battleExport.beforeBattle,
        pets: await ct(...battleExport.pets),
        strategy: loadStrategy(battleExport.strategy, scope),
    } satisfies ILevelBattleStrategy;
};
