export * from './TypeMaps.js';

export enum PetPosType {
    bag1 = 1,
    secondBag1 = 7,
    elite = 4,
    storage = 0,
}

export enum BattleFireType {
    绿火 = 6,
    金火 = 9,
}

export enum PetFragmentLevelDifficulty {
    NotSelected = 0,
    Ease = 1,
    Normal = 2,
    Hard = 3,
}

export enum SkillType {
    特殊攻击 = 2,
    物理攻击 = 1,
    属性攻击 = 4,
}

export enum ItemId {
    // 能量珠
    奇效攻击能量珠 = 300779,
    奇效特攻能量珠 = 300781,
    奇效特防能量珠 = 300782,
    奇效速度能量珠 = 300783,
    奇效防御能量珠 = 300780,
    瞬杀能量珠 = 300741,
    瞬杀能量珠Ω = 300784,
    愤怒能量珠 = 300854,
    减伤能量珠 = 300060,
    减伤能量珠Ω = 300135,
    不灭能量珠 = 300785,

    // 梦幻宝石
    低阶梦幻宝石 = 1200444,
    中阶梦幻宝石 = 1200445,
    高阶梦幻宝石 = 1200446,
    闪光梦幻宝石 = 1707149,
    闪耀梦幻宝石 = 1707150,

    精灵还原药剂Ω = 300075,
    全面提升药剂 = 300697,
    '全面提升药剂-龙' = 300810,
    友谊之星 = 1400154,
}

/** 精灵药剂 */
export enum PotionId {
    初级体力药剂 = 300011,
    中级体力药剂 = 300012,
    高级体力药剂 = 300013,
    超级体力药剂 = 300014,
    中级活力药剂 = 300017,
    高级活力药剂 = 300018,
}
