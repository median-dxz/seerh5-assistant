import { GameConfigRegistry } from '../GameConfig.js';

export default () => {
    GameConfigRegistry.register('item', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        iterator: {
            *[Symbol.iterator]() {
                const dict = Object.values(ItemXMLInfo._itemDict);
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });

    GameConfigRegistry.register('element', {
        objectId: (obj) => obj.id,
        objectName: (obj) => obj.cn,
        iterator: {
            *[Symbol.iterator]() {
                const dict = Object.values(SkillXMLInfo.typeMap);
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });

    GameConfigRegistry.register('skill', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        iterator: {
            *[Symbol.iterator]() {
                const dict = Object.values(SkillXMLInfo.SKILL_OBJ.Moves.Move);
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });

    GameConfigRegistry.register('pet', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.DefName,
        iterator: {
            *[Symbol.iterator]() {
                const dict = Object.values(PetXMLInfo._dataMap);
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });

    GameConfigRegistry.register('suit', {
        objectId: (obj) => obj.id,
        objectName: (obj) => obj.name,
        iterator: {
            *[Symbol.iterator]() {
                const dict = SuitXMLInfo._dataMap.getValues();
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });

    GameConfigRegistry.register('title', {
        objectId: (obj) => obj.SpeNameBonus,
        objectName: (obj) => obj.title,
        iterator: {
            *[Symbol.iterator]() {
                const dict = Object.values(AchieveXMLInfo.titleRules);
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });

    GameConfigRegistry.register('statusEffect', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        iterator: {
            *[Symbol.iterator]() {
                const dict = PetStatusEffectConfig.xml.BattleEffect[0].SubEffect;
                for (const item of dict) {
                    yield item;
                }
            },
        },
    });
};
