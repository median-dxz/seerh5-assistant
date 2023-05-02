import {
    Mod,
    SABattle,
    SAEngine,
    SaModuleLogger,
    defaultStyle,
    delay,
    lowerBlood,
    switchBag,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('阿尔蒂克三件套', defaultStyle.mod);

const pets = [
    { name: '潘克多斯', catchTime: 1656383521 },
    { name: '魔钰', catchTime: 1655445699 },
    { name: '蒂朵', catchTime: 1656056275 },
    { name: '帝皇之御', catchTime: 1675323310 },
];

const moveModule: SABattle.MoveModule = SABattle.generateStrategy(
    ['鬼焰·焚身术', '梦境残缺', '幻梦芳逝', '守御八方'],
    ['潘克多斯', '蒂朵', '帝皇之御', '魔钰']
);

const ct = pets.map((p) => p.catchTime);

const items = {
    圣王之心: 1713219,
};

class 阿尔蒂克三件套 extends Mod {
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
            await lowerBlood(ct);

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
