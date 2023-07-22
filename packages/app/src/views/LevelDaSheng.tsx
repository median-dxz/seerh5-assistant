import { ct } from '@sa-app/context/ct';
import type { ILevelBattleStrategy, SALevelData, SALevelInfo } from 'sa-core';
import {
    ILevelRunner,
    NoBloodSwitchLink,
    Operator,
    Potion,
    SALevelState,
    SaModuleLogger,
    Socket,
    defaultStyle,
    generateStrategy,
    lowerBlood,
} from 'sa-core';

interface LevelData extends SALevelData {
    curPosition: number;
    limit: LimitType;
    start: boolean;
}

enum LimitType {
    低于300血 = 7,
    三回合击败 = 3,
    特殊攻击 = 6,
    物理攻击 = 5,
    伤害大于2000 = 1,
    全程暴击 = 8,
    拖10回合 = 4,
    伤害小于300 = 2,
}

const options = {
    '84': {
        strategy: generateStrategy(['守御八分', '剑挥四方', '诸界混一击'], ['帝皇之御', '六界帝神', '时空界皇']),
        pets: await ct('帝皇之御', '六界帝神', '时空界皇'),
        beforeBattle: async () => lowerBlood(await ct('时空界皇')),
    },
    '84蒂朵': {
        strategy: generateStrategy(['守御八分', '剑挥四方', '幻梦芳逝'], ['帝皇之御', '六界帝神', '蒂朵']),
        pets: await ct('帝皇之御', '六界帝神', '蒂朵'),
    },
    圣谱: {
        strategy: {
            resolveMove: async (state, skill) => {
                let r = skill.find((s) => s.name === ['光荣之梦', '璀璨圣光'].at(state.round % 2));
                if (state.round > 10) {
                    r = skill.find((s) => s.name === ['神灵救世光', '光荣之梦'].at(state.round % 2));
                }
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return Operator.useSkill(r?.id);
            },
            resolveNoBlood: () => -1,
        },
        pets: await ct('圣灵谱尼'),
    },
    艾莫高伤: {
        strategy: {
            resolveMove: async (state, skill, pets) => {
                const r = skill.find((s) => s.name === '冥夜镇魂弑');
                if (r && state.round > 4) {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    return Operator.useSkill(r?.id);
                } else if (r) {
                    return Operator.switchPet(pets.findIndex((p) => p.name === '鲁肃'));
                }
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return Operator.useItem(Potion.中级活力药剂);
            },
            resolveNoBlood: (state, _, pets) => {
                return new NoBloodSwitchLink([
                    '潘克多斯',
                    '蒂朵',
                    '茉蕊儿',
                    '艾莫莉萨',
                    '鲁肃',
                    '芳馨·茉蕊儿',
                    '艾莫莉萨',
                ]).match(pets, state.self.catchtime);
            },
        },
        pets: await ct('潘克多斯', '蒂朵', '鲁肃', '芳馨·茉蕊儿', '茉蕊儿', '艾莫莉萨'),
        beforeBattle: async () => lowerBlood(await ct('潘克多斯', '蒂朵', '鲁肃', '芳馨·茉蕊儿', '茉蕊儿')),
    },
} satisfies Record<string, ILevelBattleStrategy>;

export class LevelDaSheng implements ILevelRunner<LevelData, SALevelInfo> {
    info: SALevelInfo;
    data: LevelData;
    option: typeof options;
    logger: (msg: React.ReactNode) => void;

    constructor() {
        this.logger = SaModuleLogger('大圣12轮挑战', defaultStyle.mod);
        this.info = {
            name: '大圣12轮挑战',
            maxTimes: 12,
        };
        this.data = { curPosition: 0, start: false } as LevelData;

        this.option = options;
    }

    selectBattle() {
        let battle: ILevelBattleStrategy = this.option['84'];
        console.log(this.data.limit);
        switch (this.data.limit) {
            case LimitType.低于300血:
                battle = this.option['84'];
                break;
            case LimitType.三回合击败:
                battle = this.option['84'];
                break;
            case LimitType.特殊攻击:
                battle = this.option['84'];
                break;
            case LimitType.物理攻击:
                battle = this.option['84蒂朵'];
                break;
            case LimitType.伤害大于2000:
                battle = this.option['艾莫高伤'];
                break;
            case LimitType.全程暴击:
                battle = this.option['艾莫高伤'];
                break;
            case LimitType.拖10回合:
                battle = this.option['圣谱'];
                break;
            case LimitType.伤害小于300:
                battle = this.option['84蒂朵'];
                break;
        }
        return battle;
    }

    async updater() {
        const values = await Socket.multiValue(207051, 207052);

        this.data = {
            ...this.data,

            curPosition: values[0],
            limit: values[1] as LimitType,

            leftTimes: 12 - values[0],
        };
        if (this.data.curPosition !== 12) {
            return SALevelState.BATTLE;
        } else {
            this.data.success = true;
            return SALevelState.STOP;
        }
    }

    readonly actions: Record<string, () => Promise<void>> = {
        battle: async () => {
            await Socket.sendByQueue(41950, [32, 1]);
        },
    };
}
