/**
 * 进入PVE战斗
 *
 * @param id boss id
 */
export const fightBoss = (id: number) => {
    FightManager.fightNoMapBoss(id);
};
