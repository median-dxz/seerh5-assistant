import {
    SAMod,
    SABattle,
    SAEngine,
    SAPet,
    SaModuleLogger,
    defaultStyle,
    delay,
    lowerBlood,
    switchBag,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('阿尔蒂克三件套', defaultStyle.mod);

const pets = [
    { name: '时空界皇', catchTime: 1655484346 },
    { name: '六界帝神', catchTime: 1657863632 },
    { name: '帝皇之御', catchTime: 1675323310 },
];

const moveModule: SABattle.MoveModule = SABattle.generateStrategy(
    ['守御八方', '剑挥四方', '诸界混一击'],
    ['帝皇之御', '六界帝神', '时空界皇']
);

const ct = pets.map((p) => p.catchTime);

const items = {
    圣王之心: 1713219,
};

class 阿尔蒂克三件套 extends SAMod.BaseMod {
    async init() {}
    async runAll() {
        await new Promise((res) => ItemManager.updateItems([items.圣王之心], res));
        const itemNum = SAEngine.getItemNum(items.圣王之心);
        log(`圣王之心数量: ${itemNum}`);
        if (itemNum < 30) {
            // 银翼 音浪 压血 关自动回血
            await Promise.all([
                SAEngine.changeSuit(365),
                SAEngine.changeTitle(418),
                SAEngine.toggleAutoCure(false),
                delay(300),
            ]);

            await switchBag(ct);
            await lowerBlood([1655484346]);
            await SAPet(1675323310).default();

            await SABattle.Manager.runOnce(() => {
                FightManager.fightNoMapBoss(9752);
            }, moveModule);

            ItemManager.updateItems([items.圣王之心], () => {
                log(`圣王之心数量: ${SAEngine.getItemNum(items.圣王之心)}`);
            });

            SABattle.Manager.clear();
        }
    }
    meta = { id: 'aedk4', description: '' };
}

export default 阿尔蒂克三件套;
