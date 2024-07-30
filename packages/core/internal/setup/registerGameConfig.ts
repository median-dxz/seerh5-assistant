import { GameConfigRegistry } from '../GameConfig.js';

export default () => {
    GameConfigRegistry.register('item', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        objectMap: new Map(Object.values(ItemXMLInfo._itemDict).map((v) => [v.ID, v]))
    });

    GameConfigRegistry.register('element', {
        objectId: (obj) => obj.id,
        objectName: (obj) => obj.cn,
        objectMap: new Map(Object.values(SkillXMLInfo.typeMap).map((v) => [v.id, v]))
    });

    GameConfigRegistry.register('skill', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        objectMap: new Map(Object.values(SkillXMLInfo.SKILL_OBJ.Moves.Move).map((v) => [v.ID, v]))
    });

    GameConfigRegistry.register('pet', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.DefName,
        objectMap: new Map(Object.values(PetXMLInfo._dataMap).map((v) => [v.ID, v]))
    });

    GameConfigRegistry.register('suit', {
        objectId: (obj) => obj.id,
        objectName: (obj) => obj.name,
        objectMap: new Map(SuitXMLInfo._dataMap.getValues().map((v) => [v.id, v]))
    });

    GameConfigRegistry.register('title', {
        objectId: (obj) => obj.SpeNameBonus,
        objectName: (obj) => obj.title,
        objectMap: new Map(Object.values(AchieveXMLInfo.titleRules).map((v) => [v.SpeNameBonus, v]))
    });

    GameConfigRegistry.register('statusEffect', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        objectMap: new Map(Object.values(PetStatusEffectConfig.xml.BattleEffect[0].SubEffect).map((v) => [v.ID, v]))
    });

    GameConfigRegistry.register('equipment', {
        objectId: (obj) => obj.ID,
        objectName: (obj) => obj.Name,
        objectMap: new Map(ItemSeXMLInfo._equipDict.getValues().map((v) => [v.ID, v]))
    });
};
